import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { CommonL4LModule, DateAdapterModule, JwtInterceptor } from '@frontend/common';
import { CommonUiModule, HttpLoaderFactory, WindmillModule } from '@frontend/common-ui';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { WindmillComboButtonModule } from '@windmill/ng-windmill/combo-button';
import { WindmillDatePickerModule } from '@windmill/ng-windmill/date-picker';
import { CentricPanelModule } from '@windmill/ng-windmill/deprecated-panel';
import { CentricInputTimepicker2Module } from '@windmill/ng-windmill/input-timepicker';
import { CentricRadioModule } from '@windmill/ng-windmill/radio';
import { CentricStepperModule } from '@windmill/ng-windmill/stepper';
import { CentricTextarea2Module } from '@windmill/ng-windmill/textarea';
import { NgChartsModule } from 'ng2-charts';

import { environment } from '../environment/environment';
import { AgeRestrictionComponent } from './_components/age-restriction/age-restriction.component';
import { CreateOfferComponent } from './_components/create-offer/create-offer.component';
import { DiscountModalComponent } from './_components/discount-modal/discount-modal.component';
import { FrequencyOfUseComponent } from './_components/frequency-of-use/frequency-of-use.component';
import { HeaderComponent } from './_components/header/header.component';
import { PriceRangeComponent } from './_components/price-range/price-range.component';
import { RegistrationSuccessfulComponent } from './_components/registration-successful/registration-successful.component';
import { SetupProfileComponent } from './_components/setup-profile/setup-profile.component';
import { SupplierEditComponent } from './_components/supplier-edit/supplier-edit.component';
import { DashboardComponent } from './_pages/dashboard/dashboard.component';
import { OffersChartPanelComponent } from './_pages/dashboard/offers-chart-panel/offers-chart-panel.component';
import { TransactionsPanelComponent } from './_pages/dashboard/transactions-panel/transactions-panel.component';
import { UsedOffersPanelComponent } from './_pages/dashboard/used-offers-panel/used-offers-panel.component';
import { OfferValidationComponent } from './_pages/offer-validation/offer-validation.component';
import { OffersComponent } from './_pages/offers/offers.component';
import { TransactionsComponent } from './_pages/transactions/transactions.component';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { SupplierModule } from './supplier/supplier.module';

@NgModule({
	declarations: [
		AppComponent,
		DashboardComponent,
		SetupProfileComponent,
		SupplierEditComponent,
		OffersComponent,
		CreateOfferComponent,
		FrequencyOfUseComponent,
		AgeRestrictionComponent,
		PriceRangeComponent,
		RegistrationSuccessfulComponent,
		TransactionsPanelComponent,
		UsedOffersPanelComponent,
		OffersChartPanelComponent,
		OfferValidationComponent,
		TransactionsComponent,
		DiscountModalComponent,
	],
	imports: [
		CommonUiModule.forRoot(environment),
		CommonL4LModule,
		WindmillModule,
		SupplierModule,
		CentricStepperModule,
		WindmillDatePickerModule,
		WindmillComboButtonModule,
		CentricTextarea2Module,
		CentricRadioModule,
		CentricInputTimepicker2Module,
		BrowserModule,
		BrowserAnimationsModule,
		HttpClientModule,
		DateAdapterModule,
		MatButtonModule,
		HeaderComponent,
		RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
		CentricPanelModule,
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		NgChartsModule,
	],
	providers: [
		[DatePipe],
		{
			provide: HTTP_INTERCEPTORS,
			useClass: JwtInterceptor,
			multi: true,
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
