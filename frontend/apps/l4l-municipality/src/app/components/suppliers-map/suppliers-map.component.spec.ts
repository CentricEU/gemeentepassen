/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthService, MAP_DEFAULTS } from '@frontend/common';
import { getCenter } from 'ol/extent';
import { transformExtent } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import { of } from 'rxjs';

import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { SuppliersMapComponent } from './suppliers-map.component';

jest.mock('ol', () => ({
	Map: jest.fn().mockImplementation(() => ({
		getSize: jest.fn(() => [800, 600]),
		getView: jest.fn(() => new MockView()),
		setZoom: jest.fn(),
		getCenter: jest.fn(),
		getZoom: jest.fn(),
		getZoomForResolution: jest.fn(),
		addEventListener: () => {
			return;
		},
		removeEventListener: () => {
			return;
		},
	})),
	View: jest.fn().mockImplementation(() => new MockView()),
	Feature: jest.fn().mockImplementation(() => ({
		setStyle: jest.fn(),
	})),
	Point: jest.fn().mockImplementation(() => ({})),

	VectorSource: jest.fn().mockImplementation(() => ({})),
	VectorLayer: jest.fn().mockImplementation(() => ({})),
	fromLonLat: jest.fn((coords) => coords),
}));

jest.mock('ol/layer', () => ({
	Tile: jest.fn(() => [200, 150]),
}));

jest.mock('ol/source/OSM', () => ({
	default: jest.fn().mockImplementation(() => ({
		addFeature: jest.fn(),
		getFeatures: jest.fn(() => []),
		getExtent: jest.fn(() => [0, 0, 400, 300]),
	})),
}));

jest.mock('ol/extent', () => ({
	getCenter: jest.fn(() => [200, 150]),
	createEmpty: jest.fn(),
	getHeight: jest.fn(),
	getWidth: jest.fn(),
	getTopLeft: jest.fn(),
	applyTransform: jest.fn(),
}));

class MockView {
	private center: number[] = [0, 0];
	private zoom = 8;

	setCenter(center: number[]) {
		this.center = center;
	}

	setZoom(zoom: number) {
		this.zoom = zoom;
	}

	getCenter() {
		return this.center;
	}

	getZoom() {
		return this.zoom;
	}

	getZoomForResolution() {
		return this.zoom;
	}

	fit(extent: number[], options: { size: number[]; duration: number }) {
		return '';
	}
}

class MockMunicipalitySupplierService {
	getSuppliersForMap() {
		return of([{ coordinatesString: JSON.stringify({ longitude: 0, latitude: 0 }), companyName: 'Supplier A' }]);
	}
}

class MockAuthService {
	extractSupplierInformation() {
		return 'mockTenantId';
	}
}

jest.mock('rbush', () => {
	return {
		default: class {
			load() {
				return;
			}
			insert() {
				return;
			}
			remove() {
				return;
			}
			search() {
				return [];
			}
		},
	};
});

describe('SuppliersMapComponent', () => {
	let component: SuppliersMapComponent;
	let fixture: ComponentFixture<SuppliersMapComponent>;
	let mapElement: HTMLElement;
	let mockSupplierService: MockMunicipalitySupplierService;
	let mockAuthService: MockAuthService;
	let mockMap: any;
	let mockView: MockView;
	let mockVectorSource: any;

	beforeEach(async () => {
		global.ResizeObserver = require('resize-observer-polyfill');

		await TestBed.configureTestingModule({
			declarations: [SuppliersMapComponent],
			providers: [
				{ provide: MunicipalitySupplierService, useClass: MockMunicipalitySupplierService },
				{ provide: AuthService, useClass: MockAuthService },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(SuppliersMapComponent);
		component = fixture.componentInstance;
		mockSupplierService = TestBed.inject(MunicipalitySupplierService) as unknown as MockMunicipalitySupplierService;
		mockAuthService = TestBed.inject(AuthService) as unknown as MockAuthService;
		fixture.detectChanges();

		mapElement = fixture.nativeElement.querySelector('#map');

		mockView = new MockView();
		mockMap = {
			setTarget: jest.fn(),
			addLayer: jest.fn(),
			getSize: jest.fn(() => [800, 600]),
			getView: jest.fn(() => mockView),
			addEventListener: () => {
				return;
			},
			removeEventListener: () => {
				return;
			},
		};

		(component as any).map = mockMap;

		mockVectorSource = {
			getExtent: jest.fn(() => [0, 0, 400, 300]),
		};

		jest.spyOn(mockSupplierService, 'getSuppliersForMap').mockReturnValue(of([]));

		(global as any).navigator.geolocation = {
			getCurrentPosition: jest.fn(),
			watchPosition: jest.fn(),
			clearWatch: jest.fn(),
		};

		jest.mock('ol/source/Vector', () => ({
			default: jest.fn().mockImplementation(() => ({
				addFeature: jest.fn(),
				getFeatures: jest.fn(() => []),
				getExtent: jest.fn(() => [0, 0, 400, 300]),
			})),
		}));
	});

	it('should create the component', () => {
		expect(component).toBeTruthy();
	});

	it('should render the map element in the DOM', () => {
		expect(mapElement).toBeTruthy();
		expect(mapElement.tagName).toBe('DIV');
	});

	it('should call initializeMap with data', () => {
		const initializeMapSpy = jest.spyOn(component as any, 'initializeMap');
		component.ngOnInit();
		expect(initializeMapSpy).toHaveBeenCalled();
	});

	it('should calculate zoom level correctly when map size is defined', () => {
		mockMap.getSize = jest.fn(() => [800, 600]);
		mockView.getZoomForResolution = jest.fn((resolution: number) => 10) as any;

		const extent = [0, 0, 400, 300];
		const zoomLevel = (component as any).calculateZoomLevel(extent);

		expect(mockView.getZoomForResolution).toHaveBeenCalledWith(
			Math.max((extent[2] - extent[0]) / 800, (extent[3] - extent[1]) / 600),
		);
		expect(zoomLevel).toBe(9);
	});

	it('should return default zoom level when map size is undefined', () => {
		mockMap.getSize = jest.fn(() => undefined);

		const extent = [0, 0, 400, 300];
		const zoomLevel = (component as any).calculateZoomLevel(extent);

		expect(zoomLevel).toBe(8);
	});

	test.each([
		['mockTenantId', true],
		['', false],
	])('should %s initialize map when tenantId is %s', (tenantId, shouldInitialize) => {
		jest.spyOn(mockAuthService, 'extractSupplierInformation').mockReturnValue(tenantId);
		const initializeMapSpy = jest.spyOn(component as any, 'initializeMap');

		component['initializeSuppliersData']();

		if (shouldInitialize) {
			expect(mockSupplierService.getSuppliersForMap).toHaveBeenCalled();
			expect(initializeMapSpy).toHaveBeenCalled();
		} else {
			expect(mockSupplierService.getSuppliersForMap).not.toHaveBeenCalled();
			expect(initializeMapSpy).not.toHaveBeenCalled();
		}
	});

	it('should call initializeSuppliersData on ngOnInit', () => {
		const initializeSuppliersDataSpy = jest.spyOn(component as any, 'initializeSuppliersData');

		component.ngOnInit();

		expect(initializeSuppliersDataSpy).toHaveBeenCalled();
	});

	it('should create a vector source with features from data', () => {
		const vectorSourceMock = {
			addFeature: jest.fn(),
			getFeatures: jest.fn(() => []),
			getExtent: jest.fn(() => [0, 0, 400, 300]),
		};
		jest.spyOn(VectorSource.prototype, 'addFeature').mockImplementation(vectorSourceMock.addFeature);
		jest.spyOn(VectorSource.prototype, 'getFeatures').mockImplementation(vectorSourceMock.getFeatures);
		jest.spyOn(VectorSource.prototype, 'getExtent').mockImplementation(vectorSourceMock.getExtent);

		const data = [
			{ id: '12', coordinatesString: JSON.stringify({ longitude: 10, latitude: 10 }), companyName: 'Company B' },
		];

		component['createVectorSource'](data);

		expect(vectorSourceMock.addFeature).toHaveBeenCalled();
	});

	it('should create a vector source with features from data', () => {
		const data = [
			{ id: '12', coordinatesString: JSON.stringify({ longitude: 10, latitude: 10 }), companyName: 'Company B' },
		];

		const vectorSource = component['createVectorSource'](data);

		expect(vectorSource).toBeTruthy();
	});

	it('should initialize the map with suppliers data', () => {
		const suppliersData = [
			{
				coordinatesString: JSON.stringify({ longitude: 30, latitude: 50 }),
				companyName: 'Supplier 1',
			},
		];

		component['initializeMap'](suppliersData as any);
		jest.spyOn(component as any, 'calculateCenterAndZoom').mockReturnValue(null);

		expect(component.map).not.toBeNull();
	});

	it('should return calculated zoom level when map size is defined', () => {
		mockMap.getSize.mockReturnValue([800, 600]);
		component.map = mockMap;

		const extent = [0, 0, 400, 300];
		const zoomLevel = component['calculateZoomLevel'](extent);

		expect(mockMap.getSize).toHaveBeenCalled();

		expect(zoomLevel).toBe(7);
	});

	it('should return default zoom level when map size is undefined', () => {
		component.map = undefined as any;

		const extent = [0, 0, 400, 300];
		const zoomLevel = component['calculateZoomLevel'](extent);

		expect(zoomLevel).toBe(8);
	});

	it('should return 8 when getZoomForResolution returns undefined', () => {
		mockMap.getSize.mockReturnValue([800, 600]);
		mockView.getZoomForResolution = () => undefined as any;

		component.map = mockMap;

		const extent = [0, 0, 400, 300];
		const zoomLevel = component['calculateZoomLevel'](extent);

		expect(mockMap.getSize).toHaveBeenCalled();

		expect(zoomLevel).toBe(8);
	});

	describe('Geolocation', () => {
		let mockGeolocation: any;

		beforeEach(() => {
			mockGeolocation = {
				getCurrentPosition: jest.fn(),
				watchPosition: jest.fn(),
				clearWatch: jest.fn(),
			};

			jest.spyOn(navigator.geolocation, 'getCurrentPosition');
		});

		it('should call navigator.geolocation.getCurrentPosition when setUserLocationAsDefault is called', () => {
			(component as any).setUserLocationAsDefault();
			expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalled();
		});

		it('should handle geolocation success correctly', () => {
			const mockPosition = {
				coords: {
					longitude: 30,
					latitude: 50,
				},
			};

			const handleGeolocationSuccessSpy = jest.spyOn(component as any, 'handleGeolocationSuccess');

			component['setUserLocationAsDefault']();
			const getCurrentPositionCallback = (navigator.geolocation.getCurrentPosition as jest.Mock).mock.calls[0][0];
			getCurrentPositionCallback(mockPosition);

			expect(handleGeolocationSuccessSpy).toHaveBeenCalledWith(mockPosition);
			expect(component.showEmptyState).toBe(false);
		});

		it('should handle geolocation success correctly', () => {
			const mockPosition: GeolocationPosition = {
				coords: {
					longitude: 30,
					latitude: 50,
					accuracy: 0,
					altitude: null,
					altitudeAccuracy: null,
					heading: null,
					speed: null,
				},
				timestamp: Date.now(),
			};

			const expectedCenter = getCenter(
				transformExtent(
					[
						mockPosition.coords.longitude - MAP_DEFAULTS.DEFAULT_RADIUS / MAP_DEFAULTS.METERS_PER_DEGREE,
						mockPosition.coords.latitude - MAP_DEFAULTS.DEFAULT_RADIUS / MAP_DEFAULTS.METERS_PER_DEGREE,
						mockPosition.coords.longitude + MAP_DEFAULTS.DEFAULT_RADIUS / MAP_DEFAULTS.METERS_PER_DEGREE,
						mockPosition.coords.latitude + MAP_DEFAULTS.DEFAULT_RADIUS / MAP_DEFAULTS.METERS_PER_DEGREE,
					],
					MAP_DEFAULTS.COORDINATE_SYSTEMS.GEOGRAPHIC,
					MAP_DEFAULTS.COORDINATE_SYSTEMS.WEB_MERCATOR,
				),
			);

			const handleGeolocationSuccessSpy = jest.spyOn(component as any, 'handleGeolocationSuccess');

			component['setUserLocationAsDefault']();
			const getCurrentPositionCallback = (navigator.geolocation.getCurrentPosition as jest.Mock).mock.calls[0][0];
			getCurrentPositionCallback(mockPosition);

			expect(handleGeolocationSuccessSpy).toHaveBeenCalledWith(mockPosition);
		});
	});

	describe('Geolocation absence', () => {
		beforeEach(() => {
			(global as any).originalGeolocation = navigator.geolocation;

			(global as any).navigator.geolocation = undefined;
		});

		afterEach(() => {
			(global as any).navigator.geolocation = (global as any).originalGeolocation;
		});

		it('should return early if navigator.geolocation is not available', () => {
			const setUserLocationAsDefaultSpy = jest.spyOn(component as any, 'setUserLocationAsDefault');

			component['setUserLocationAsDefault']();

			expect(setUserLocationAsDefaultSpy).toHaveBeenCalled();
			expect(navigator.geolocation).toBeUndefined();
		});
	});

	describe('Geolocation Error Handling', () => {
		let mockGeolocation: any;

		beforeEach(() => {
			mockGeolocation = {
				getCurrentPosition: jest.fn(),
				watchPosition: jest.fn(),
				clearWatch: jest.fn(),
			};

			jest.spyOn(navigator.geolocation, 'getCurrentPosition');
		});

		it('should set showEmptyState to true when geolocation fails', () => {
			(component as any).setUserLocationAsDefault();
			const getCurrentPositionErrorCallback = (navigator.geolocation.getCurrentPosition as jest.Mock).mock
				.calls[0][1];

			getCurrentPositionErrorCallback();

			expect(component.showEmptyState).toBe(true);
		});
	});
});
