import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { SupplierService } from '../../services/supplier-service/supplier.service';
import { TestComponent } from './test.component';

describe('TestComponent', () => {
	let component: TestComponent;
	let fixture: ComponentFixture<TestComponent>;
	let supplierService: SupplierService;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [TestComponent],
			imports: [
				WindmillModule,
				CommonModule,
				HttpClientModule,
				BrowserAnimationsModule,
				TranslateModule.forRoot(),
				BrowserModule,
			],
			providers: [{ provide: 'env', useValue: environmentMock }, SupplierService],
		}).compileComponents();

		fixture = TestBed.createComponent(TestComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		supplierService = TestBed.inject(SupplierService);
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should call getTestRequest on supplierService', () => {
		const spy = jest.spyOn(supplierService, 'getTestRequest');

		component.testMethod();

		expect(spy).toHaveBeenCalled();
	});
});
