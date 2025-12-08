import { Route } from '@angular/router';
import { AppType, authGuard, commonRoutingConstants, nonAuthGuard } from '@frontend/common';
import { ChangePasswordComponent, EmailActionComponent, LoginComponent } from '@frontend/common-ui';

import { SupplierDetailsComponent } from './components/supplier-details/supplier-details.component';
import { SuppliersListComponent } from './components/suppliers/suppliers.component';
import { BenefitsComponent } from './pages/benefits/benefits.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { OffersForMuniciaplityComponent } from './pages/offers-for-municipality/offers-for-municipality.component';
import { PassholdersComponent } from './pages/passholders/passholders.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { MunicipalityTransactionsComponent } from './pages/transactions/transactions.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';

export const appRoutes: Route[] = [
	{ path: '', redirectTo: commonRoutingConstants.dashboard, pathMatch: 'full' },
	{
		path: commonRoutingConstants.supplierDetails,
		component: SupplierDetailsComponent,
		canActivate: [authGuard],
	},
	{
		path: commonRoutingConstants.supplierOffers,
		component: SupplierDetailsComponent,
		canActivate: [authGuard],
		data: { route: commonRoutingConstants.supplierOffers },
	},
	{ path: commonRoutingConstants.suppliers, component: SuppliersListComponent, canActivate: [authGuard] },
	{
		path: commonRoutingConstants.offers,
		component: OffersForMuniciaplityComponent,
		canActivate: [authGuard],
	},
	{ path: commonRoutingConstants.passholders, component: PassholdersComponent, canActivate: [authGuard] },
	{
		path: commonRoutingConstants.login,
		component: LoginComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.municipality },
	},
	{
		path: commonRoutingConstants.recover,
		component: EmailActionComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.municipality },
	},
	{ path: commonRoutingConstants.dashboard, component: DashboardComponent, canActivate: [authGuard] },
	{
		path: commonRoutingConstants.userManagement,
		component: UserManagementComponent,
		canActivate: [authGuard],
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
	{
		path: commonRoutingConstants.profile,
		component: ProfilePageComponent,
		canActivate: [authGuard],
	},
	{
		path: commonRoutingConstants.benefits,
		component: BenefitsComponent,
		canActivate: [authGuard],
	},
	{
		path: commonRoutingConstants.transactions,
		component: MunicipalityTransactionsComponent,
		canActivate: [authGuard],
	},
	{ path: '**', redirectTo: commonRoutingConstants.dashboard, pathMatch: 'full' },
];
