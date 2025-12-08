import { DatePipe } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { APP_CONFIG } from '@frontend/app-config';
import { CommonL4LModule, DateAdapterModule, JwtInterceptor } from '@frontend/common';
import { CommonUiModule, HttpLoaderFactory, WindmillModule } from '@frontend/common-ui';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { WindmillComboButtonModule } from '@windmill/ng-windmill/combo-button';
import { WindmillDatePickerModule } from '@windmill/ng-windmill/date-picker';
import { CentricRadioModule } from '@windmill/ng-windmill/radio';
import { CentricTextarea2Module } from '@windmill/ng-windmill/textarea';
import { environment } from '../environment/environment';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { AppRoutingModule } from './app.routing.module';
import { ActiveSuppliersComponent } from './components/active-suppliers/active-suppliers.component';
import { BankDetailsDialogComponent } from './components/bank-details-dialog/bank-details-dialog.component';
import { CreateUserPopupComponent } from './components/create-user-popup/create-user-popup.component';
import { GenerateInvoiceComponent } from './components/generate-invoice/generate-invoice.component';
import { ImportPassholdersComponent } from './components/import-passholders/import-passholders.component';
import { InvitationsComponent } from './components/invitations/invitations.component';
import { InviteSuppliersComponent } from './components/invite-suppliers/invite-suppliers.component';
import { OfferApprovalPopupComponent } from './components/offer-approval-popup/offer-approval-popup.component';
import { SupplierDetailsComponent } from './components/supplier-details/supplier-details.component';
import { SupplierReqComponent } from './components/supplier-req/supplier-req.component';
import { SupplierReviewPopupComponent } from './components/supplier-review-popup/supplier-review-popup.component';
import { SuppliersListComponent } from './components/suppliers/suppliers.component';
import { SuppliersMapComponent } from './components/suppliers-map/suppliers-map.component';
import { MunicipalityModule } from './municipality/municipality.module';
import { BenefitsComponent } from './pages/benefits/benefits.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OffersForMuniciaplityComponent } from './pages/offers-for-municipality/offers-for-municipality.component';
import { PassholdersComponent } from './pages/passholders/passholders.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { MunicipalityTransactionsComponent } from './pages/transactions/transactions.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';

@NgModule({
	declarations: [
		AppComponent,
		DashboardComponent,
		SuppliersListComponent,
		SupplierReqComponent,
		ActiveSuppliersComponent,
		SupplierReviewPopupComponent,
		OfferApprovalPopupComponent,
		PassholdersComponent,
		ImportPassholdersComponent,
		SupplierDetailsComponent,
		OffersForMuniciaplityComponent,
		InviteSuppliersComponent,
		InvitationsComponent,
		UserManagementComponent,
		CreateUserPopupComponent,
		SuppliersMapComponent,
		BankDetailsDialogComponent,
		ProfilePageComponent,
		BenefitsComponent,
		GenerateInvoiceComponent,
		MunicipalityTransactionsComponent,
	],
	imports: [
		AppRoutingModule,
		CommonUiModule.forRoot(environment),
		CommonL4LModule,
		WindmillModule,
		MunicipalityModule,
		MatTabsModule,
		BrowserModule,
		HttpClientModule,
		BrowserAnimationsModule,
		HttpClientModule,
		WindmillDatePickerModule,
		WindmillComboButtonModule,
		CentricTextarea2Module,
		CentricRadioModule,
		DateAdapterModule,
		RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
		MatDialogModule,
	],
	providers: [
		[DatePipe],
		{ provide: APP_CONFIG, useValue: environment },
		{
			provide: HTTP_INTERCEPTORS,
			useClass: JwtInterceptor,
			multi: true,
		},
	],
	bootstrap: [AppComponent],
})
export class AppModule {}
