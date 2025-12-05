import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

import { CommonUiModule } from '../../common-ui.module';
import { WindmillModule } from '../../windmil.module';
import { ChipRemainingDialogComponent } from './chip-remaining-dialog.component';

describe('ChipRemainingDialogComponent', () => {
	let component: ChipRemainingDialogComponent;
	let fixture: ComponentFixture<ChipRemainingDialogComponent>;
	const dialogRefStub = { close: () => undefined };

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [ChipRemainingDialogComponent],
			imports: [CommonUiModule, WindmillModule, TranslateModule.forRoot()],
			providers: [
				{ provide: MAT_DIALOG_DATA, useValue: { arrayOfChips: ['Chip1', 'Chip2'], chipTitleColumn: 'title' } },
				{ provide: MatDialogRef, useValue: dialogRefStub },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(ChipRemainingDialogComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should initialize with provided data', () => {
		fixture.detectChanges();
		expect(component.arrayOfChips).toEqual(['Chip1', 'Chip2']);
		expect(component.chipTitleColumn).toEqual('title');
	});

	it('should close dialog on close', () => {
		jest.spyOn(dialogRefStub, 'close');
		component.close();
		expect(dialogRefStub.close).toHaveBeenCalled();
	});
});
