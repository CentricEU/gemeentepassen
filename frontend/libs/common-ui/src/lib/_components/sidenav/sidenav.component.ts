import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, commonRoutingConstants, NavigationService, TenantService } from '@frontend/common';
import { CustomRoutes } from '@windmill/ng-windmill/sidenav';

@Component({
	selector: 'frontend-sidenav',
	templateUrl: './sidenav.component.html',
	styleUrls: ['./sidenav.component.scss'],
	standalone: false,
})
export class SidenavComponent {
	@Input()
	public navigationItems: CustomRoutes;
	public opened = true;
	public decodedImage: string | ArrayBuffer | null;

	constructor(
		private authService: AuthService,
		private tenantService: TenantService,
		private navigationService: NavigationService,
		private router: Router,
	) {}

	public get tenantLogo(): string {
		return this.tenantService.tenantLogo;
	}

	public logout(): void {
		this.authService.logout();
		this.navigationService.reloadCurrentRoute();
	}

	public isAllDataLoaded(): boolean {
		return !!this.tenantService.tenant;
	}

	public navigateToDashboard(): void {
		this.router.navigate([commonRoutingConstants.dashboard]);
	}
}
