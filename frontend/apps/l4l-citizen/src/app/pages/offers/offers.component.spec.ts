/* eslint-disable @typescript-eslint/no-explicit-any */
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CentricToastrModule } from '@windmill/ng-windmill/toastr';

import { OffersComponent } from './offers.component';

describe('OffersComponent', () => {
	let component: OffersComponent;
	let fixture: ComponentFixture<OffersComponent>;
	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [
				OffersComponent,
				WindmillModule,
				CommonModule,
				BrowserAnimationsModule,
				HttpClientModule,
				TranslateModule.forRoot(),
				CentricToastrModule.forRoot(),
			],
			providers: [{ provide: 'env', useValue: environmentMock }, TranslateService],
		}).compileComponents();

		fixture = TestBed.createComponent(OffersComponent);
		component = fixture.componentInstance;
		(component as any).transactionChart = {
			loadChartData: jest.fn(),
		};
	});

	it('should create', () => {
		fixture.detectChanges();
		expect(component).toBeTruthy();
	});
});
