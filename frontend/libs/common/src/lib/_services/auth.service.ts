import { HttpClient } from '@angular/common/http';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Role } from '../_enums/roles.enum';
import { UserInfo } from '../_enums/user-information.enum';
import { DecodedToken } from '../_models/decoded-token.model';
import { Environment } from '../_models/environment.model';
import { JwtToken } from '../_models/jwt-token.model';
import { RefreshToken } from '../_models/refresh-token.model';
import { JwtUtil } from '../_util/jwt.util';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	public loginEventEmitter = new EventEmitter<boolean>();

	private jwtDecode = JwtUtil.decodeToken;
	private decodedToken: DecodedToken | null;

	constructor(
		@Inject('env') private environment: Environment,
		private http: HttpClient,
	) {}

	public get token(): DecodedToken | null {
		if (!this.decodedToken) {
			this.decodeToken(this.jwtToken);
		}
		return this.decodedToken;
	}

	public get userRole(): string | undefined {
		return this.checkIfTokenExists() ? this.token?.role : undefined;
	}

	public get jwtToken(): string {
		return localStorage.getItem('JWT_TOKEN') as string;
	}

	public get isLoggedIn(): boolean {
		return this.checkIfTokenExists();
	}

	public extractSupplierInformation(field: UserInfo): string | undefined {
		if (!this.checkIfTokenExists()) {
			return;
		}
		return this.token ? this.token[field] : undefined;
	}

	public login(
		username: string,
		password: string,
		recaptcha: string,
		rememberMe: boolean,
		role: Role,
	): Observable<void> {
		const body = JSON.stringify({
			username: username,
			password: password,
			reCaptchaResponse: recaptcha,
			rememberMe: rememberMe,
			role: role,
		});

		const url = `${this.environment.apiPath}/authenticate`;
		return this.http.post(url, body).pipe(
			map((data) => {
				const result = data as JwtToken;
				this.setSession(result.token);
				this.loginEventEmitter.emit(true);
			}),
		);
	}

	public refreshToken(): Observable<RefreshToken> {
		const url = `${this.environment.apiPath}/authenticate/refreshToken`;
		// Use withCredentials: true to make your browser include cookies and authentication headers in your XHR request
		return this.http.post<RefreshToken>(url, {}, { withCredentials: true });
	}

	public logout(): void {
		this.cookieCleaningLogout();
		this.decodeAndRemoveJwt();
	}

	private decodeAndRemoveJwt(): void {
		this.decodedToken = null;
		localStorage.removeItem('JWT_TOKEN');
	}

	private cookieCleaningLogout(): void {
		const url = `${this.environment.apiPath}/logout`;
		this.http.post(url, {}, { withCredentials: true }).subscribe();
	}

	private decodeToken(token: string): void {
		this.decodedToken = this.jwtDecode(token) as DecodedToken;
	}

	private setSession(authResult: string): void {
		this.decodeToken(authResult);

		if (!this.decodedToken) {
			return;
		}
		localStorage.setItem('JWT_TOKEN', authResult);
	}

	private checkIfTokenExists(): boolean {
		const token = localStorage.getItem('JWT_TOKEN');
		if (!token) {
			return false;
		}

		return true;
	}
}
