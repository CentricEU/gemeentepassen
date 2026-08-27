import { InjectionToken } from '@angular/core';
import { AuthConfig, OAuthModuleConfig } from 'angular-oauth2-oidc';

import { environment } from '../../environment/environment';

/**
 * Configuration object for Signicat authentication.
 *
 * @remarks
 * This configuration is used to set up OAuth2/OpenID Connect authentication
 * with Signicat's sandbox environment for the CityPasses development instance.
 *
 * @property issuer - The URL of the OpenID Connect issuer.
 * @property clientId - The client ID registered with Signicat.
 * @property redirectUri - The URI to redirect to after authentication.
 * @property responseType - The OAuth2 response type, typically 'code' for authorization code flow.
 * @property scope - The scopes requested during authentication (e.g., 'openid', 'profile', 'email', 'nin').
 * @property strictDiscoveryDocumentValidation - Whether to strictly validate the discovery document.
 * @property showDebugInformation - Enables debug information for authentication flows.
 */
function createSignicatAuthConfig(argument: string): AuthConfig {
	const redirectUri = `${window.location.origin}/${argument}`;

	return {
		issuer: 'https://citypasses-dev.sandbox.signicat.com/auth/open',
		clientId: 'sandbox-harebrained-heart-686',
		redirectUri,
		responseType: 'code',
		scope: 'openid profile email nin',
		strictDiscoveryDocumentValidation: false,
		showDebugInformation: true,
		customQueryParams: {
			prompt: 'login',
		},
	};
}

export { createSignicatAuthConfig };
export const OAUTH_CONFIG = new InjectionToken<AuthConfig>('OAUTH_CONFIG');

/**
 * OAuth module configuration object for Signicat integration.
 *
 * @remarks
 * This configuration specifies the resource server settings for OAuth authentication.
 * The `allowedUrls` array defines which API endpoints are permitted for authenticated requests,
 * and `sendAccessToken` determines whether the access token should be included in requests to those endpoints.
 *
 * @public
 */
export const oauthModuleConfig: OAuthModuleConfig = {
	resourceServer: {
		allowedUrls: [environment.apiPath],
		sendAccessToken: true,
	},
};
