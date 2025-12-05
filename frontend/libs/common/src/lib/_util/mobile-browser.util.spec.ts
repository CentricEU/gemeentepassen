import { MobileBrowserUtil } from './mobile-browser.util';

describe('MobileBrowserUtil', () => {
	const originalUserAgent = navigator.userAgent;
	const originalLocation = window.location;

	afterEach(() => {
		Object.defineProperty(navigator, 'userAgent', {
			value: originalUserAgent,
			configurable: true,
		});
		window.location = originalLocation;
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

		Object.defineProperty(window, 'location', {
			value: mockLocation,
			writable: true,
		});

		MobileBrowserUtil.openMobileApp(param);

		expect(mockLocation.href).toBe(`localforlocal://${param}`);
	});
});
