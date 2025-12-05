import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { AppModule } from '../../app.module';
import { MonthYearEntry } from '../../models/month-year-entry.model';
import { TransactionsDateMenuComponent } from './transactions-date-menu.component';

describe('TransactionsDateMenuComponent', () => {
	let component: TransactionsDateMenuComponent;
	let fixture: ComponentFixture<TransactionsDateMenuComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			schemas: [NO_ERRORS_SCHEMA],
			declarations: [TransactionsDateMenuComponent],
			imports: [WindmillModule, TranslateModule.forRoot(), AppModule],
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
