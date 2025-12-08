import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, createUrlTreeFromSnapshot, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../_services/auth.service';
import { Role } from '../_enums/roles.enum';

export const authGuard = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const authService = inject(AuthService);

	if (authService.isLoggedIn) {
		return true;
	}

	return createUrlTreeFromSnapshot(next, ['/', 'login'], { returnUrl: state.url });
};

export const authGuardSupplier = (next: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
	const authService = inject(AuthService);

	if (authService.isLoggedIn) {
		if (authService.userRole?.name === Role.CASHIER) {
			return false;
		}
		return true;
	}

	return createUrlTreeFromSnapshot(next, ['/', 'login'], { returnUrl: state.url });
};
