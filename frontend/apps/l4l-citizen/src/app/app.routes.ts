import { Route } from '@angular/router';
import { AppType, authGuard, commonRoutingConstants, mobileOnlyGuard, nonAuthGuard } from '@frontend/common';

import { DashboardComponent } from './pages/dashboard/dashboard.component';

export const appRoutes: Route[] = [
	{ path: '', component: DashboardComponent, canActivate: [authGuard] },
	{
		path: commonRoutingConstants.login,
		canActivate: [nonAuthGuard],
		data: { app: AppType.citizen },
		loadComponent: () =>
			import('./pages/login-with-digid/login-with-digid.component').then((m) => m.LoginWithDigiDComponent),
	},
	{
		path: commonRoutingConstants.dashboard,
		canActivate: [authGuard],
		data: { app: AppType.citizen },
		loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
	},
	{
		path: commonRoutingConstants.digidCategory,
		canActivate: [authGuard],
		data: { app: AppType.citizen },
		loadComponent: () =>
			import('./pages/digid-category/digid-category.component').then((m) => m.DigiDCategoryComponent),
	},
	{
		path: commonRoutingConstants.noneCategoryFit,
		canActivate: [authGuard],
		data: { app: AppType.citizen },
		loadComponent: () =>
			import('./pages/none-category-fit/none-category-fit.component').then((m) => m.NoneCategoryFitComponent),
	},
	{
		path: commonRoutingConstants.citizenGroupAssignment,
		canActivate: [authGuard],
		data: { app: AppType.citizen },
		loadComponent: () =>
			import('./pages/citizen-group-assignment/citizen-group-assignment.component').then(
				(m) => m.CitizenGroupAssignmentComponent,
			),
	},
	{
		path: commonRoutingConstants.openInApp,
		canActivate: [nonAuthGuard, mobileOnlyGuard],
		data: { app: AppType.citizen },
		loadComponent: () => import('./pages/mobile-only/mobile-only.component').then((m) => m.MobileOnlyComponent),
	},
	{
		path: commonRoutingConstants.applyForPass,
		canActivate: [nonAuthGuard],
		data: { app: AppType.citizen },
		loadComponent: () =>
			import('./pages/apply-for-pass/apply-for-pass.component').then((m) => m.ApplyForPassComponent),
	},
	{
		path: commonRoutingConstants.applyForPassSetup,
		canActivate: [authGuard],
		data: { app: AppType.citizen },
		loadComponent: () =>
			import('./pages/apply-for-pass-setup/apply-for-pass-setup.component').then(
				(m) => m.ApplyForPassSetupComponent,
			),
	},
	{ path: '**', redirectTo: '', pathMatch: 'full' },
];
