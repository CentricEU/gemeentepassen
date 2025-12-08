import { Route } from '@angular/router';
import { AppType, authGuard, authGuardSupplier, commonRoutingConstants, nonAuthGuard } from '@frontend/common';
import { ChangePasswordComponent, LoginComponent } from '@frontend/common-ui';
import { EmailActionComponent } from '@frontend/common-ui';

import { RegistrationSuccessfulComponent } from './_components/registration-successful/registration-successful.component';
import { SupplierEditComponent } from './_components/supplier-edit/supplier-edit.component';
import { DashboardComponent } from './_pages/dashboard/dashboard.component';
import { OfferValidationComponent } from './_pages/offer-validation/offer-validation.component';
import { OffersComponent } from './_pages/offers/offers.component';
import { TransactionsComponent } from './_pages/transactions/transactions.component';
import { SupplierRegisterComponent } from './supplier-register/supplier-register.component';

export const appRoutes: Route[] = [
	{ path: '', component: DashboardComponent, canActivate: [authGuard] },
	{
		path: commonRoutingConstants.editProfile,
		component: SupplierEditComponent,
		canActivate: [authGuardSupplier],
	},
	{
		path: commonRoutingConstants.offers,
		component: OffersComponent,
		canActivate: [authGuardSupplier],
	},
	{
		path: commonRoutingConstants.offerValidation,
		component: OfferValidationComponent,
		canActivate: [authGuardSupplier],
	},
	{
		path: commonRoutingConstants.transactions,
		component: TransactionsComponent,
		canActivate: [authGuardSupplier],
	},
	{
		path: `${commonRoutingConstants.offers}/rejection-reason/:offerId`,
		component: OffersComponent,
		canActivate: [authGuardSupplier],
	},
	{
		path: `${commonRoutingConstants.register}`,
		component: SupplierRegisterComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.supplier },
	},
	{
		path: `${commonRoutingConstants.register}/:tenantId`,
		component: SupplierRegisterComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.supplier },
	},
	{
		path: commonRoutingConstants.login,
		component: LoginComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.supplier },
	},
	{
		path: commonRoutingConstants.recover,
		component: EmailActionComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.supplier },
	},
	{
		path: commonRoutingConstants.registrationSuccessful,
		component: RegistrationSuccessfulComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.municipality },
	},
	{
		path: `${commonRoutingConstants.resendConfirmationEmail}/:token`,
		component: EmailActionComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.municipality },
	},
	{
		path: `${commonRoutingConstants.recover}/reset-password/:token`,
		component: ChangePasswordComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.municipality },
	},
	{
		path: `${commonRoutingConstants.setupPassword}/:token/:username`,
		component: ChangePasswordComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.municipality },
	},
	{ path: '**', redirectTo: '', pathMatch: 'full' },
];
