import { UserClaimsService } from './user-claims.service';

describe('UserClaimsService ()', () => {
	let service: UserClaimsService;

	beforeEach(() => {
		service = new UserClaimsService();
		localStorage.clear();
	});

	it('should be created', () => {
		expect(service).toBeDefined();
	});

	it('should set BSN and store it in localStorage', (done) => {
		const testBsn = '123456789';

		service.setBsn(testBsn);

		expect(localStorage.getItem('bsn')).toBe(testBsn);

		service.bsn$.subscribe((bsn) => {
			expect(bsn).toBe(testBsn);
			done();
		});
	});

	it('should load BSN from localStorage and emit it', (done) => {
		const storedBsn = '987654321';
		localStorage.setItem('bsn', storedBsn);

		service.loadBsnFromStorage();

		service.bsn$.subscribe((bsn) => {
			expect(bsn).toBe(storedBsn);
			done();
		});
	});

	it('should not emit if BSN is not in localStorage', (done) => {
		localStorage.removeItem('bsn');

		let emitted = false;

		service.loadBsnFromStorage();

		service.bsn$.subscribe(() => {
			emitted = true;
		});

		setTimeout(() => {
			expect(emitted).toBe(false);
			done();
		}, 50);
	});

	it('should return BSN from localStorage using getBsn()', () => {
		const testBsn = '555555555';
		localStorage.setItem('bsn', testBsn);

		const result = service.getBsn();

		expect(result).toBe(testBsn);
	});

	it('should return null from getBsn() if BSN is not in localStorage', () => {
		localStorage.removeItem('bsn');

		const result = service.getBsn();

		expect(result).toBeNull();
	});
});
