import { Component } from '@angular/core';
import { AppType } from '@frontend/common';
import { GenericAppComponent } from '@frontend/common-ui';
import { CustomRoutes } from '@windmill/ng-windmill/sidenav';

@Component({
	selector: 'frontend-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
	standalone: false,
})
export class AppComponent extends GenericAppComponent {
	public override applicationType = AppType.municipality;

	public override getMenuItemsForNavigation(): CustomRoutes {
		return [
			{
				icon: 'layout-grid_b',
				path: 'dashboard',
				name: this.translateService.instant('general.pages.dashboard'),
			},
			{
				icon: 'hand-euro-coin_b',
				path: 'benefits',
				name: this.translateService.instant('general.pages.benefits'),
			},
			{
				icon: 'shop_b',
				path: '',
				children: [
					{
						path: 'suppliers',
						name: this.translateService.instant('general.pages.suppliers'),
					},
					{
						path: 'offers',
						name: this.translateService.instant('general.pages.pendingOffers'),
					},
				],
				name: this.translateService.instant('general.pages.suppliers'),
			},
			{
				icon: 'id-card_b',
				path: 'passholders',
				name: this.translateService.instant('general.pages.passholders'),
			},
			{
				icon: 'hand-card_b',
				path: 'transactions',
				name: this.translateService.instant('general.pages.transactions'),
			},
			{
				icon: 'person_person_br',
				path: 'user-management',
				name: this.translateService.instant('general.pages.userManagement'),
			},
			{
				icon: 'settings_b',
				path: 'profile',
				name: this.translateService.instant('general.pages.profile'),
			},
		];
	}
}
