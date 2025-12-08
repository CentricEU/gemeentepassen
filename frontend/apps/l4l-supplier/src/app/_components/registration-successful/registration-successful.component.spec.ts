import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { commonRoutingConstants, MobileBrowserUtil } from '@frontend/common';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { of } from 'rxjs';

import { RegistrationSuccessfulComponent } from './registration-successful.component';

describe('RegistrationSuccessfulComponent', () => {
	let component: RegistrationSuccessfulComponent;
	let fixture: ComponentFixture<RegistrationSuccessfulComponent>;
	let dialogService: DialogService;

	const dialogServiceMock = {
		message: jest.fn(),
	};

	const mobileBrowserUtilMock = {
		isMobile: jest.fn(),
		openMobileApp: jest.fn(),
	};

	const environmentMock = {
		production: false,
		prefixes: 'localforlocal://',
		envName: 'dev',
		apiPath: '/api',
	};

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [RegistrationSuccessfulComponent],
			imports: [RouterTestingModule],
			providers: [
				{ provide: DialogService, useValue: dialogServiceMock },
				{ provide: MobileBrowserUtil, useValue: mobileBrowserUtilMock },
				{ provide: 'env', useValue: environmentMock },
			],
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(RegistrationSuccessfulComponent);
		component = fixture.componentInstance;
		dialogService = TestBed.inject(DialogService);
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call displaySuccessfulRegistrationDialog on ngOnInit', () => {
		const displaySpy = jest.spyOn(component as any, 'displaySuccessfulRegistrationDialog');
		component.ngOnInit();
		expect(displaySpy).toHaveBeenCalled();
	});

	it('should navigate to login', () => {
		const navigateSpy = jest.spyOn(component['router'], 'navigate');
		component['navigateToLogin']();
		expect(navigateSpy).toHaveBeenCalledWith([commonRoutingConstants.login]);
	});

	it('should display successful registration dialog and navigate to login on close', () => {
		const dialogRefSpyObj = { afterClosed: jest.fn(() => of(true)) } as unknown as MatDialogRef<any>;
		const messageSpy = jest.spyOn(dialogService, 'message').mockReturnValue(dialogRefSpyObj);

		const navigateSpy = jest.spyOn(component as any, 'navigateToLogin');

		component.ngOnInit();

		expect(messageSpy).toHaveBeenCalled();

		dialogRefSpyObj.afterClosed().subscribe(() => {
			expect(navigateSpy).toHaveBeenCalled();
		});
	});
});
