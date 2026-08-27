import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppType, commonRoutingConstants } from '@frontend/common';
import { AppLoaderComponent, BreadcrumbsComponent, GenericAppComponent, SidenavComponent } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { CustomRoutes } from '@windmill/ng-windmill/sidenav';

@Component({
	standalone: true,
	imports: [RouterModule, SidenavComponent, TranslateModule, BreadcrumbsComponent, AppLoaderComponent],
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss',
})
export class AppComponent extends GenericAppComponent {
	public override applicationType = AppType.citizen;

	public override getMenuItemsForNavigation(): CustomRoutes {
		return [
			{
				icon: 'hand-euro-coin_b',
				path: commonRoutingConstants.offers,
				name: this.translateService.instant('general.pages.offers'),
			},
			{
				icon: 'coins_b',
				path: commonRoutingConstants.discounts,
				name: this.translateService.instant('general.pages.discounts'),
			},
			{
				icon: 'hand-card_b',
				path: commonRoutingConstants.transactions,
				name: this.translateService.instant('general.pages.transactions'),
			},
			{
				icon: 'person-circle_b',
				path: `/${commonRoutingConstants.editProfile}`,
				name: this.translateService.instant('general.pages.editProfile'),
			},
		];
	}
}
