import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot } from '@angular/router';

import { commonRoutingConstants } from '../_constants/common-routing.constants';
import { AuthService } from '../_services/auth.service';

export const nonAuthGuard = (next: ActivatedRouteSnapshot) => {
	const authService = inject(AuthService);
	if (!authService.isLoggedIn) {
		return true;
	}
	return createUrlTreeFromSnapshot(next, ['/', commonRoutingConstants.dashboard]);
};
