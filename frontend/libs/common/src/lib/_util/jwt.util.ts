import jwt_decode from 'jwt-decode';

import { DecodedToken } from '../_models/decoded-token.model';

export class JwtUtil {
	public static decodeToken(token: string): DecodedToken | null {
		try {
			return jwt_decode(token);
		} catch (Error) {
			return null;
		}
	}
}
