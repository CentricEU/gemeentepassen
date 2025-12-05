import { Route } from '@angular/router';
import { AppType, authGuardMunicipality, commonRoutingConstants, nonAuthGuard } from '@frontend/common';
import { ChangePasswordComponent, EmailActionComponent, LoginComponent } from '@frontend/common-ui';

import { SupplierDetailsComponent } from './components/supplier-details/supplier-details.component';
import { SuppliersListComponent } from './components/suppliers/suppliers.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { GrantsComponent } from './pages/grants/grants/grants.component';
import { OffersForMuniciaplityComponent } from './pages/offers-for-municipality/offers-for-municipality.component';
import { PassholdersComponent } from './pages/passholders/passholders.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';

export const appRoutes: Route[] = [
	{ path: '', component: DashboardComponent, canActivate: [authGuardMunicipality] },
	{
		path: commonRoutingConstants.supplierDetails,
		component: SupplierDetailsComponent,
		canActivate: [authGuardMunicipality],
	},
	{
		path: commonRoutingConstants.supplierOffers,
		component: SupplierDetailsComponent,
		canActivate: [authGuardMunicipality],
		data: { route: commonRoutingConstants.supplierOffers },
	},
	{ path: commonRoutingConstants.suppliers, component: SuppliersListComponent, canActivate: [authGuardMunicipality] },
	{
		path: commonRoutingConstants.offers,
		component: OffersForMuniciaplityComponent,
		canActivate: [authGuardMunicipality],
	},
	{ path: commonRoutingConstants.passholders, component: PassholdersComponent, canActivate: [authGuardMunicipality] },
	{ path: commonRoutingConstants.grants, component: GrantsComponent, canActivate: [authGuardMunicipality] },
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
	{ path: commonRoutingConstants.dashboard, component: DashboardComponent, canActivate: [authGuardMunicipality] },
	{
		path: commonRoutingConstants.userManagement,
		component: UserManagementComponent,
		canActivate: [authGuardMunicipality],
	},
	{
		path: `${commonRoutingConstants.recover}/reset-password/:token`,
		component: ChangePasswordComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.municipality },
	},
	{ path: '**', redirectTo: commonRoutingConstants.dashboard, pathMatch: 'full' },
];
