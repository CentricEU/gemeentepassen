import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatMenuModule } from '@angular/material/menu';
import { MonthYearEntry } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';

import { CommonUiModule } from '../../common-ui.module';
import { WindmillModule } from '../../windmil.module';
import { TransactionsDateMenuComponent } from './transactions-date-menu.component';

describe('TransactionsDateMenuComponent', () => {
	let component: TransactionsDateMenuComponent;
	let fixture: ComponentFixture<TransactionsDateMenuComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			imports: [WindmillModule, CommonUiModule, TranslateModule.forRoot(), MatMenuModule],
			providers: [],
		}).compileComponents();

		fixture = TestBed.createComponent(TransactionsDateMenuComponent);
		component = fixture.componentInstance;

		component.selectedDate = { monthLabel: 'Jan', monthValue: 1, year: 2024 };
		component.menuData = [];

		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should emit selectedMonth event when selectMonth is called', () => {
		const monthYearEntry: MonthYearEntry = { monthLabel: 'Jan', monthValue: 1, year: 2021 };
		const emitSpy = jest.spyOn(component.selectedMonth, 'emit');

		component.selectMonth(monthYearEntry);

		expect(emitSpy).toHaveBeenCalledWith(monthYearEntry);
	});
});
