import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../_services/auth.service';

export const authGuardMunicipality = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const authService = inject(AuthService);
	if (authService.isLoggedIn) {
		return true;
	}

	return createUrlTreeFromSnapshot(next, ['/', 'login'], { returnUrl: state.url });
};
