import { Environment } from '../_models/environment.model';
import { MobileBrowserUtil } from './mobile-browser.util';

describe('MobileBrowserUtil', () => {
	const originalUserAgent = navigator.userAgent;
	const originalLocation = window.location;

	afterEach(() => {
		Object.defineProperty(navigator, 'userAgent', {
			value: originalUserAgent,
			configurable: true,
		});
		Object.defineProperty(window, 'location', {
			value: originalLocation,
			configurable: true,
		});
	});

	it('should return true for mobile user agents', () => {
		const mobileUserAgents = [
			'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
			'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.99 Mobile Safari/537.36',
			'Mozilla/5.0 (iPad; CPU OS 13_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.2 Mobile/15E148 Safari/604.1',
		];

		mobileUserAgents.forEach((userAgent) => {
			Object.defineProperty(navigator, 'userAgent', {
				value: userAgent,
				configurable: true,
			});

			expect(MobileBrowserUtil.isMobile()).toBe(true);
		});
	});

	it('should return false for non-mobile user agents', () => {
		const desktopUserAgents = [
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
			'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
		];

		desktopUserAgents.forEach((userAgent) => {
			Object.defineProperty(navigator, 'userAgent', {
				value: userAgent,
				configurable: true,
			});

			expect(MobileBrowserUtil.isMobile()).toBe(false);
		});
	});

	it('should set the correct URL for openMobileApp', () => {
		const param = 'Login';
		const mockLocation = {
			href: '',
		};
		const environment = new Environment();
		environment.prefixes = 'localforlocal://';

		Object.defineProperty(window, 'location', {
			value: mockLocation,
			writable: true,
		});

		MobileBrowserUtil.openMobileApp(environment, param);
		expect(mockLocation.href).toBe(`localforlocal://${param}`);
	});

	it('should return true for Android user agents', () => {
		const androidUserAgents = [
			'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.99 Mobile Safari/537.36',
			'Mozilla/5.0 (Android; Mobile; rv:40.0) Gecko/40.0 Firefox/40.0',
			'Mozilla/5.0 (Linux; U; Android 4.0.3; en-us; HTC_One_X Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Mobile Safari/534.30',
		];

		androidUserAgents.forEach((userAgent) => {
			Object.defineProperty(navigator, 'userAgent', {
				value: userAgent,
				configurable: true,
			});

			expect(MobileBrowserUtil.isAndroid()).toBe(true);
		});
	});

	it('should return false for non-Android user agents', () => {
		const nonAndroidUserAgents = [
			'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
			'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
		];

		nonAndroidUserAgents.forEach((userAgent) => {
			Object.defineProperty(navigator, 'userAgent', {
				value: userAgent,
				configurable: true,
			});

			expect(MobileBrowserUtil.isAndroid()).toBe(false);
		});
	});
});
