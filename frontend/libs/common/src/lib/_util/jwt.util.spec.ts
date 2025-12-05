import * as jwt from 'jsonwebtoken';

import { DecodedToken } from '../_models/decoded-token.model';
import { JwtUtil } from './jwt.util';

describe('JwtUtil', () => {
	it('should decode a valid JWT token', () => {
		const decodedToken = new DecodedToken();
		decodedToken.sub = 'user123';
		decodedToken.exp = 1234567890;
		decodedToken.iat = 1698944972;

		const secretKey = 'test-secret';
		const mockValidTokenAdmin = jwt.sign(
			{
				sub: 'user123',
				exp: 1234567890,
				iat: 1698944972,
			},
			secretKey,
		);
		const result = JwtUtil.decodeToken(mockValidTokenAdmin);
		expect(result).toEqual(decodedToken);
	});

	it('should handle an invalid JWT token gracefully and return null', () => {
		const invalidToken = 'invalid.jwt.token';

		const result = JwtUtil.decodeToken(invalidToken);

		expect(result).toBeNull();
	});

	it('should handle an empty token and return null', () => {
		const emptyToken = '';

		const result = JwtUtil.decodeToken(emptyToken);

		expect(result).toBeNull();
	});
});
