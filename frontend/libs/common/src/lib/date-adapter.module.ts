import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

const DATE_FORMATS = {
	display: {
		dateInput: 'DD/MM/YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
	parse: {
		dateInput: 'DD/MM/YYYY',
	},
};
@NgModule({
	providers: [
		{
			provide: MAT_DATE_FORMATS,
			useValue: {
				...DATE_FORMATS,
			},
		},
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE],
		},
		{ provide: MAT_DATE_LOCALE, useValue: 'nl-NL' },
	],
})
export class DateAdapterModule {}
