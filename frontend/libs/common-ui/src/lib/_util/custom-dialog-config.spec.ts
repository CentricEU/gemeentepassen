import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatDialogConfig } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { TenantService } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';

import { CustomDialogComponent } from '../_components/custom-dialog/custom-dialog.component';
import { CommonUiModule } from '../common-ui.module';
import { WindmillModule } from '../windmil.module';
import { CustomDialogConfigUtil } from './custom-dialog-config';

describe('CustomDialog', () => {
	let customDialog: CustomDialogComponent;
	let fixture: ComponentFixture<CustomDialogComponent>;

	const environmentMock = {
		production: false,
		envName: 'dev',
		apiPath: '/api',
	};

	const dialogRefStub = { close: () => undefined, afterClosed: () => undefined };

	global.structuredClone = jest.fn((val) => {
		return JSON.parse(JSON.stringify(val));
	});

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				CommonUiModule,
				BrowserAnimationsModule,
				RouterTestingModule,
				WindmillModule,
				HttpClientTestingModule,
				TranslateModule.forRoot(),
			],
			providers: [
				{ provide: TenantService },
				{ provide: MAT_DIALOG_DATA, useValue: {} },
				{
					provide: MatDialogRef,
					useValue: dialogRefStub,
				},
				{ provide: 'env', useValue: environmentMock },
			],
		});
		fixture = TestBed.createComponent(CustomDialogComponent);
		customDialog = fixture.componentInstance;
	});

	it('should create', () => {
		expect(customDialog).toBeTruthy();
	});

	it('should create a MatDialogConfig with the correct properties', () => {
		const successModal = {
			title: 'Test Title',
			mainContent: 'Test Main Content',
			secondaryContent: 'Test Secondary Content',
			cancelButtonText: 'Cancel',
			acceptButtonText: 'Accept',
			disableClosing: false,
			fileName: 'test.txt',
			modalTypeClass: '',
			tooltipColor: 'theme',
		};

		const expectedConfig = {
			width: '600px',
			disableClose: false,
			autoFocus: true,
			data: {
				title: successModal.title,
				mainContent: successModal.mainContent,
				secondaryContent: successModal.secondaryContent,
				cancelButtonText: successModal.cancelButtonText,
				acceptButtonText: successModal.acceptButtonText,
				disableClosing: successModal.disableClosing,
				acceptButtonType: 'high-emphasis-success',
				cancelButtonType: 'ghost-greyscale',
				comments: '',
				modalTypeClass: '',
				optionalText: undefined,
				fileName: successModal.fileName,
				tooltipColor: 'theme',
			},
		};

		const result = CustomDialogConfigUtil.createMessageModal(successModal);
		expect(result).toEqual(expectedConfig);
	});

	it('should SET acceptButtonType = warning when modalTypeClass=warning', () => {
		const successModal = {
			title: 'Test Title',
			mainContent: 'Test Main Content',
			secondaryContent: 'Test Secondary Content',
			cancelButtonText: 'Cancel',
			acceptButtonText: 'Accept',
			disableClosing: false,
			fileName: 'test.txt',
			modalTypeClass: 'warning',
			tooltipColor: 'theme',
		};

		const expectedConfig = {
			width: '600px',
			disableClose: false,
			autoFocus: true,
			data: {
				title: successModal.title,
				mainContent: successModal.mainContent,
				secondaryContent: successModal.secondaryContent,
				cancelButtonText: successModal.cancelButtonText,
				acceptButtonText: successModal.acceptButtonText,
				disableClosing: successModal.disableClosing,
				acceptButtonType: 'high-emphasis-warning',
				cancelButtonType: 'ghost-greyscale',
				comments: '',
				modalTypeClass: 'warning',
				optionalText: undefined,
				fileName: successModal.fileName,
				tooltipColor: 'theme',
			},
		};

		const result = CustomDialogConfigUtil.createMessageModal(successModal);
		expect(result).toEqual(expectedConfig);
	});

	describe('getAcceptedButtonType', () => {
		it('should set acceptButtonType to high-emphasis-warning when modalTypeClass is "warning"', () => {
			const config: MatDialogConfig = { data: {} };
			CustomDialogConfigUtil['getAcceptedButtonType']('warning', config);
			expect(config.data.acceptButtonType).toBe('high-emphasis-warning');
		});

		it('should set acceptButtonType to high-emphasis-danger when modalTypeClass is "danger"', () => {
			const config: MatDialogConfig = { data: {} };
			CustomDialogConfigUtil['getAcceptedButtonType']('danger', config);
			expect(config.data.acceptButtonType).toBe('high-emphasis-danger');
		});

		it('should not change acceptButtonType when modalTypeClass is not "warning" or "alert"', () => {
			const config: MatDialogConfig = { data: { acceptButtonType: 'initialButtonType' } };
			CustomDialogConfigUtil['getAcceptedButtonType']('otherType', config);
			expect(config.data.acceptButtonType).toBe('initialButtonType');
		});
	});
});
