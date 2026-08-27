import { Route } from '@angular/router';
import { AppType, authGuard, commonRoutingConstants, nonAuthGuard } from '@frontend/common';
import { ChangePasswordComponent, EmailActionComponent, LoginComponent } from '@frontend/common-ui';

import { OffersComponent } from './pages/offers/offers.component';
import { CitizenTransactionsComponent } from './pages/transactions/citizen-transactions';
import { DiscountsComponent } from './pages/discounts/discounts';
import { CitizenProfileComponent } from './pages/profile/citizen-profile';

export const appRoutes: Route[] = [
	{ path: '', redirectTo: commonRoutingConstants.offers, pathMatch: 'full' },
	{
		path: commonRoutingConstants.login,
		component: LoginComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.citizen },
	},
	{
		path: commonRoutingConstants.recover,
		component: EmailActionComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.citizen },
	},
	{ path: commonRoutingConstants.offers, component: OffersComponent, canActivate: [authGuard] },
	{
		path: `${commonRoutingConstants.recover}/reset-password/:token`,
		component: ChangePasswordComponent,
		canActivate: [nonAuthGuard],
		data: { app: AppType.citizen },
	},
	{ path: commonRoutingConstants.transactions, component: CitizenTransactionsComponent, canActivate: [authGuard] },
	{ path: commonRoutingConstants.discounts, component: DiscountsComponent, canActivate: [authGuard] },
	{ path: commonRoutingConstants.editProfile, component: CitizenProfileComponent, canActivate: [authGuard] },
	{ path: '**', redirectTo: commonRoutingConstants.offers, pathMatch: 'full' },
];
