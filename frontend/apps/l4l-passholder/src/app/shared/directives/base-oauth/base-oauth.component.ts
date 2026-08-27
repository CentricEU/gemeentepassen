import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@frontend/common';

import { OauthSpecService } from '../../../services/oauth-service/oauth.service';
import { UserClaimsService } from '../../../services/user-claims/user-claims.service';

@Component({
	selector: 'app-base-oauth',
	template: '',
})
export abstract class BaseOAuthComponent implements OnInit {
	protected abstract get defaultRedirectUrl(): string;
	
	protected readonly userClaimsService = inject(UserClaimsService);
	protected readonly oauthService = inject(OauthSpecService);
	protected readonly authService = inject(AuthService);

	protected readonly route = inject(ActivatedRoute);
	protected readonly router = inject(Router);

	public ngOnInit(): void {
		this.checkForOAuthParams();
	}

	public loginWithDigiD(): void {
		this.oauthService.authenticateWithDigid();
	}

	protected onLoginSuccess(): void {
		const bsn = this.extractBsnFromClaims();

		sessionStorage.clear();
		this.storeBsn(bsn);

		const returnUrl = this.route.snapshot.queryParams['returnUrl'] || this.defaultRedirectUrl;
		this.router.navigate([returnUrl], { replaceUrl: true });
	}

	private extractBsnFromClaims(): string | null {
		const claims = JSON.parse(sessionStorage.getItem('id_token_claims_obj') || '{}');
		return claims.nin;
	}

	private storeBsn(bsnInfo: string | null): void {
		if (bsnInfo) {
			this.userClaimsService.setBsn(bsnInfo);
		}
	}

	private checkForOAuthParams(): void {
		let code = this.route.snapshot?.queryParamMap.get('code');
		let state = this.route.snapshot?.queryParamMap.get('state');

		if (!code || !state) {
			const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
			if (returnUrl) {
				const searchParams = new URLSearchParams(returnUrl.split('?')[1] ?? '');
				code = searchParams.get('code');
				state = searchParams.get('state');
			}
		}

		if (code && state) {
			this.handleOAuthLogin();
		}
	}

	private handleOAuthLogin(): void {
		this.oauthService.oauthServiceInstance.loadDiscoveryDocumentAndTryLogin().then(() => {
			if (this.oauthService.oauthServiceInstance.hasValidAccessToken()) {
				this.oauthService.setupSilentRefresh();
				const tokenRequest = this.oauthService.tokenResponse;

				this.authService.authenticateWithSignicat(tokenRequest).subscribe(() => {
					this.onLoginSuccess();
				});
			}
		});
	}
}
