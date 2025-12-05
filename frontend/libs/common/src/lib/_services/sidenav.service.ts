import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { commonRoutingConstants } from '../_constants/common-routing.constants';
import { AppType } from '../_enums/app-type.enum';

@Injectable({
	providedIn: 'root',
})
export class SidenavService {
	constructor(private router: Router) {}

	public shouldHideNavigation(appType: string): boolean {
		const currentPath = this.router.url.slice(1);
		const isSupplierApp = appType === AppType.supplier;
		const isSupplierComponent = this.checkForSupplierComponent(currentPath);
		const isMunicipalityComponent = this.checkForCommonComponents(currentPath);

		return isSupplierApp ? isSupplierComponent : isMunicipalityComponent;
	}

	public reloadCurrentRoute(): void {
		const currentUrl = '/';

		this.router.navigateByUrl(commonRoutingConstants.login, { skipLocationChange: true }).then(() => {
			this.router.navigate([currentUrl]);
		});
	}

	private checkForCommonComponents(currentPath: string): boolean {
		const validPaths = [
			commonRoutingConstants.register,
			commonRoutingConstants.login,
			commonRoutingConstants.recover,
			commonRoutingConstants.resendConfirmationEmail,
			commonRoutingConstants.registrationSuccessful,
		];
		let isCommonComponent = false;
		validPaths.forEach((definedPath: string) => {
			if (currentPath.includes(definedPath)) {
				isCommonComponent = true;
			}
		});
		return isCommonComponent;
	}

	private checkForSupplierComponent(currentPath: string): boolean {
		return this.checkForCommonComponents(currentPath) || currentPath === commonRoutingConstants.recover;
	}
}
