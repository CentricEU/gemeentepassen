import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { commonRoutingConstants } from '../../_constants/common-routing.constants';

@Injectable({
	providedIn: 'root',
})
export class NavigationService {
	constructor(private router: Router) {}

	public reloadCurrentRoute(): void {
		const currentUrl = '/';

		this.router.navigateByUrl(commonRoutingConstants.login, { skipLocationChange: true }).then(() => {
			this.router.navigate([currentUrl]);
		});
	}
}
