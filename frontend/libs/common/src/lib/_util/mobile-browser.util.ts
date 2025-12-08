import { Environment } from '../_models/environment.model';

export class MobileBrowserUtil {
	public static isMobile(): boolean {
		const userAgent: string = navigator.userAgent || navigator.vendor || (window as any)['opera'];
		const mobileRegex =
			/android|bbd+|meego.+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.browser|up\.link|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i;

		return (
			mobileRegex.test(userAgent) ||
			'ontouchstart' in window ||
			('orientation' in window && window['orientation'] !== undefined)
		);
	}

	public static openMobileApp(environment: Environment, param: string): void {
		window.location.href = `${environment.prefixes}${param}`;
	}

	public static isAndroid(): boolean {
		const userAgent: string = navigator.userAgent || navigator.vendor || (window as any)['opera'];
		return /android/i.test(userAgent);
	}
}
