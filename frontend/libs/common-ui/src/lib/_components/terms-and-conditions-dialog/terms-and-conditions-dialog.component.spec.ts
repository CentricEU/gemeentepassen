import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';

import { WindmillModule } from '../../windmil.module';
import { TermsAndConditionsDialogComponent } from './terms-and-conditions-dialog.component';

describe('TermsAndConditionsDialogComponent', () => {
	let component: TermsAndConditionsDialogComponent;
	let fixture: ComponentFixture<TermsAndConditionsDialogComponent>;

	const dialogServiceStub = { closeAll: jest.fn() };

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [TranslateModule.forRoot(), WindmillModule, NoopAnimationsModule, HttpClientTestingModule],
			declarations: [TermsAndConditionsDialogComponent],
			providers: [
				{ provide: MAT_DIALOG_DATA, useValue: {} },
				{
					provide: DialogService,
					useValue: dialogServiceStub,
				},
			],
		}).compileComponents();

		fixture = TestBed.createComponent(TermsAndConditionsDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should close the dialog with false', () => {
		component.closeDialog();
		expect(dialogServiceStub.closeAll).toHaveBeenCalled();
	});
});
