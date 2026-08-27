import { Injectable } from '@angular/core';
import { TokenRequest } from '@frontend/common';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';

@Injectable({ providedIn: 'root' })
export class OauthSpecService {
	public get oauthServiceInstance(): OAuthService {
		return this.oauthService;
	}

	public get tokenResponse(): TokenRequest {
		return new TokenRequest(this.oauthService.getIdToken(), this.oauthService.getAccessToken());
	}

	constructor(private oauthService: OAuthService) {}

	public configure(config: AuthConfig): void {
		this.oauthService.configure(config);
	}

	public authenticateWithDigid(): void {
		this.oauthService.loadDiscoveryDocument().then(() => {
			this.oauthService.initLoginFlow();
		});
	}

	public logout(): void {
		this.oauthService.logOut(true);
	}

	public setupSilentRefresh(): void {
		this.oauthService.setupAutomaticSilentRefresh();
	}
}
