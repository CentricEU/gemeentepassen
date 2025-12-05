import { Component, OnInit } from '@angular/core';
import { AuthService, MAP_DEFAULTS, SupplierForMapViewDto, UserInfo } from '@frontend/common';
import { Feature, Map, View } from 'ol';
import { defaults as defaultControls, Zoom } from 'ol/control';
import { getCenter } from 'ol/extent';
import { Point } from 'ol/geom';
import { Tile } from 'ol/layer';
import VectorLayer from 'ol/layer/Vector';
import { fromLonLat, transformExtent } from 'ol/proj';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';

import { MunicipalitySupplierService } from '../../_services/suppliers.service';

@Component({
	selector: 'frontend-suppliers-map',
	templateUrl: './suppliers-map.component.html',
	styleUrls: ['./suppliers-map.component.scss'],
})
export class SuppliersMapComponent implements OnInit {
	public map: Map;
	public showEmptyState = false;

	constructor(
		private supplierService: MunicipalitySupplierService,
		private authService: AuthService,
	) {}

	public ngOnInit(): void {
		this.initializeSuppliersData();
	}

	private initializeSuppliersData(): void {
		const tenantId = this.authService.extractSupplierInformation(UserInfo.TenantId);
		if (!tenantId) {
			return;
		}

		this.supplierService.getSuppliersForMap(tenantId).subscribe((data) => {
			this.initializeMap(data);
		});
	}

	private createMap(vectorLayer: VectorLayer<Feature>): void {
		this.map = new Map({
			layers: [new Tile({ source: new OSM() }), vectorLayer],
			target: 'map',
			view: new View({
				center: fromLonLat([0, 0]),
				zoom: MAP_DEFAULTS.ZOOM_LEVEL,
			}),
			controls: defaultControls({
				zoom: false,
				attribution: true,
			}).extend([
				new Zoom({
					className: 'custom-zoom-control',
				}),
			]),
		});
	}

	private initializeMap(data: SupplierForMapViewDto[]): void {
		if (!data.length) {
			this.setUserLocationAsDefault();
			return;
		}

		const vectorSource = this.createVectorSource(data);
		const vectorLayer = new VectorLayer({
			source: vectorSource,
		});

		this.createMap(vectorLayer);
		this.calculateCenterAndZoom(vectorSource);
	}

	private setUserLocationAsDefault(): void {
		if (!navigator.geolocation) {
			this.showEmptyState = true;
			return;
		}

		navigator.geolocation.getCurrentPosition(
			(position) => this.handleGeolocationSuccess(position),
			() => (this.showEmptyState = true),
		);
	}

	private handleGeolocationSuccess(position: GeolocationPosition): void {
		const userCoordinates = [position.coords.longitude, position.coords.latitude];

		const degreesRadius = MAP_DEFAULTS.DEFAULT_RADIUS / MAP_DEFAULTS.METERS_PER_DEGREE;

		const extent = transformExtent(
			[
				userCoordinates[0] - degreesRadius,
				userCoordinates[1] - degreesRadius,
				userCoordinates[0] + degreesRadius,
				userCoordinates[1] + degreesRadius,
			],
			MAP_DEFAULTS.COORDINATE_SYSTEMS.GEOGRAPHIC,
			MAP_DEFAULTS.COORDINATE_SYSTEMS.WEB_MERCATOR,
		);

		const center = getCenter(extent);
		const vectorSource = new VectorSource();

		this.createMap(new VectorLayer({ source: vectorSource }));
		this.map.getView().setCenter(center);
		this.map.getView().fit(extent, { duration: 1000 });
	}

	private createFeatureFromSupplier(supplier: SupplierForMapViewDto): Feature {
		const coordinates = JSON.parse(supplier.coordinatesString);

		const feature = new Feature({
			geometry: new Point(fromLonLat([coordinates.longitude, coordinates.latitude])),
			name: supplier.companyName,
		});

		feature.setStyle(
			new Style({
				image: new Icon({
					src: '/assets/images/map-marker.svg',
					scale: MAP_DEFAULTS.MARKER_SCALE,
				}),
			}),
		);

		return feature;
	}

	private createVectorSource(data: SupplierForMapViewDto[]): VectorSource {
		const vectorSource = new VectorSource();

		const features = data.map(this.createFeatureFromSupplier);

		features.forEach((feature) => vectorSource.addFeature(feature));

		return vectorSource;
	}

	private calculateCenterAndZoom(vectorSource: VectorSource): void {
		const extent = vectorSource.getExtent();
		const center = getCenter(extent);
		const features = vectorSource.getFeatures();

		const isSingleFeature = features.length === 1;
		const zoom = this.calculateZoomLevel(extent, isSingleFeature);

		const view = this.map.getView();
		view.setCenter(center);
		view.setZoom(zoom);
	}

	private calculateZoomLevel(extent: number[], isSingleState = false): number {
		const mapSize = this.map?.getSize();
		if (!mapSize || isSingleState) return MAP_DEFAULTS.ZOOM_LEVEL;

		const resolution = Math.max((extent[2] - extent[0]) / mapSize[0], (extent[3] - extent[1]) / mapSize[1]);
		const zoom = this.map.getView().getZoomForResolution(resolution);

		return zoom !== undefined ? zoom - 1 : MAP_DEFAULTS.ZOOM_LEVEL;
	}
}
