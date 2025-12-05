import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableColumn } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';

import { WindmillModule } from '../../windmil.module';
import { TableColumnsManagerComponent } from './table-columns-manager.component';

describe('TableColumnsManagerComponent', () => {
	let component: TableColumnsManagerComponent;
	let fixture: ComponentFixture<TableColumnsManagerComponent>;
	const mockDialogRef = {
		close: jest.fn(),
	};

	const mockData = {
		tableColumns: [
			[
				new TableColumn('Column 1', 'prop 1', 'value1', true, false),
				new TableColumn('Column 1', 'prop 1', 'value2', true, false),
			],
		],
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [BrowserAnimationsModule, TranslateModule.forRoot(), WindmillModule],
			declarations: [TableColumnsManagerComponent],
			providers: [
				{ provide: MatDialogRef, useValue: mockDialogRef },
				{ provide: MAT_DIALOG_DATA, useValue: mockData },
			],
		}).compileComponents();

		fixture = TestBed.createComponent(TableColumnsManagerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should close the dialog when cancel button is clicked', () => {
		component.close();
		expect(mockDialogRef.close).toHaveBeenCalledWith(false);
	});

	it('should close the dialog with updated tableColumns when accept button is clicked', () => {
		const updatedColumns = [
			new TableColumn('Column 1', 'prop 1', 'value1', true, false),
			new TableColumn('Column 1', 'prop 1', 'value2', true, false),
		];
		component.tableColumns = updatedColumns;
		component.accept();
		expect(mockDialogRef.close).toHaveBeenCalledWith(updatedColumns);
	});

	it('should return true for isButtonDisabled when there are no changes', () => {
		component['initializeTableColumnsState']();
		expect(component.isButtonDisabled()).toBe(true);
	});

	it('should return false for isButtonDisabled when there are changes', () => {
		component['initializeTableColumnsState']();
		component.tableColumns[0].isChecked = false;
		expect(component.isButtonDisabled()).toBe(true);
	});
});
