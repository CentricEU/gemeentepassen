/**
 * Configuration object for Signicat OIDC authentication in a native mobile app.
 *
 * Parameters:
 * - clientId: The public identifier for the app registered with Signicat. Safe to include in native apps.
 * - redirectUrl: The URI where Signicat will redirect after authentication. Must be registered and domain-verified.
 * - scopes: An array of OIDC scopes requesting specific user information (e.g., identity, profile, email).
 * - serviceConfiguration:
 *    - authorizationEndpoint: The URL to initiate the authentication request.
 *    - tokenEndpoint: The URL to exchange the authorization code for access and ID tokens.
 *
 * Notes:
 * - This configuration assumes PKCE is enabled and client secrets are disabled in the Signicat OIDC Client configuration.
 * - PKCE ensures secure authentication for public clients like native mobile apps.
 * - For more details you can access the Signicat documentation at https://developer.signicat.com/docs/eid-hub/oidc/native-mobile-apps/ (Edit existing OIDC clients).
 */

import { AuthConfiguration } from "react-native-app-auth";

export const getSignicatConfig = (lang: string): AuthConfiguration => {
    const redirectBase = 'https://citizen.testing.gemeentepassen.eu/open-in-app';
    const redirectUrl = `${redirectBase}?lang=${encodeURIComponent(lang)}`;

    return {
        clientId: 'sandbox-harebrained-heart-686',
        redirectUrl,
        scopes: ['openid', 'profile', 'email', 'nin'],
        serviceConfiguration: {
            authorizationEndpoint: 'https://citypasses-dev.sandbox.signicat.com/auth/open/connect/authorize',
            tokenEndpoint: 'https://citypasses-dev.sandbox.signicat.com/auth/open/connect/token',
        },
        additionalParameters: {
            prompt: 'login',
        },
    };
};

