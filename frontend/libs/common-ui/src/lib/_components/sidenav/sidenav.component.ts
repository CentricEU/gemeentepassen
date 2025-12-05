import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, commonRoutingConstants, SidenavService, TenantService } from '@frontend/common';
import { CustomRoutes } from '@windmill/ng-windmill';

@Component({
	selector: 'frontend-sidenav',
	templateUrl: './sidenav.component.html',
	styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent {
	@Input()
	public navigationItems: CustomRoutes;
	public opened = true;

	constructor(
		private authService: AuthService,
		private tenantService: TenantService,
		private sidenavService: SidenavService,
		private router: Router,
	) {}

	public get tenantName(): string {
		return this.tenantService.tenant.name;
	}

	public logout(): void {
		this.authService.logout();
		this.sidenavService.reloadCurrentRoute();
	}

	public isAllDataLoaded(): boolean {
		return !!this.tenantService.tenant;
	}

	public navigateToDashboard(): void {
		this.router.navigate([commonRoutingConstants.dashboard]);
	}
}
