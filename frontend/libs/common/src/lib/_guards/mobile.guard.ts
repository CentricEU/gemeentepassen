import { inject } from '@angular/core';
import { Router } from '@angular/router';

import { MobileBrowserUtil } from '../_util/mobile-browser.util';

export const mobileOnlyGuard = () => {
	const router = inject(Router);
	const isMobile = MobileBrowserUtil.isMobile();

	if (!isMobile) {
		router.navigate(['/']);
		return false;
	}

	return true;
};
