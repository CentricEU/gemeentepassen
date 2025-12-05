import { SupplierCoordinates } from '../_models/supplier-coordinates.model';
import { PdokUtil } from './pdok.util';

describe('PdokUtil', () => {
	it('should parse coordinates correctly from valid data', () => {
		const validData = {
			response: {
				docs: [
					{
						centroide_ll: 'POINT(10.12345 20.67890)',
					},
				],
			},
		};

		const result = PdokUtil.getCoordinatesFromPdok(validData);

		expect(result).toBeInstanceOf(SupplierCoordinates);
		expect(result.longitude).toBeCloseTo(10.12345);
		expect(result.latitude).toBeCloseTo(20.6789);
	});

	it('should throw an error for invalid data', () => {
		const invalidData = {
			response: {
				docs: [{}],
			},
		};

		expect(() => PdokUtil.getCoordinatesFromPdok(invalidData)).toThrow();
	});
});
