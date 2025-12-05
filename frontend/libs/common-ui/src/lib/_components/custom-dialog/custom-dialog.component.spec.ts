import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { WindmillModule } from '../../windmil.module';
import { CustomDialogComponent } from './custom-dialog.component';

describe('CustomDialogComponent', () => {
	let component: CustomDialogComponent;
	let fixture: ComponentFixture<CustomDialogComponent>;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const dialogRefStub = { close: () => undefined, afterClosed: () => undefined };

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [TranslateModule.forRoot(), WindmillModule, NoopAnimationsModule, HttpClientTestingModule],
			declarations: [CustomDialogComponent],
			providers: [
				{ provide: MAT_DIALOG_DATA, useValue: {} },
				{
					provide: MatDialogRef,
					useValue: dialogRefStub,
				},
				{ provide: 'env', useValue: environmentMock },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(CustomDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should close the dialog with false', () => {
		jest.spyOn(dialogRefStub, 'close');

		component.close();
		expect(dialogRefStub.close).toHaveBeenCalledWith(false);
	});

	it('should close the dialog with true', () => {
		jest.spyOn(dialogRefStub, 'close');

		component.accept();
		expect(dialogRefStub.close).toHaveBeenCalledWith(true);
	});
});
