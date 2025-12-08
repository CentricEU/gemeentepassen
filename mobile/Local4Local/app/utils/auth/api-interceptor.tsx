import axios from 'axios';
import { apiPath } from '../constants/api';
import { clearAllTokens, retrieveToken, storeToken } from './jwtSecurity';
import { StatusCode } from "../enums/statusCode.enum";
import { Platform } from 'react-native';
import { AuthenticationStateType } from '../../contexts/authentication/authentication-context';

const api = axios.create({
    baseURL: apiPath,
    timeout: 10000,
});

interface InitializeApiParams {
    setAuthState: (state: AuthenticationStateType) => void;
    handleClearWatch: () => void;
}

async function handleLogoutAndResetState(setAuthState: any, handleClearWatch: () => void) {
    await clearAllTokens();
    const errorMessage = 'generic.errors.unauthorized';
    setAuthState({ accessToken: null, refreshToken: null, authenticated: false, accountDeleted: false, error: errorMessage });
    handleClearWatch();
}

async function handleTokenRefresh(originalRequest: any, setAuthState: any, handleClearWatch: { (): void; (): void; (): void; }) {
    const refreshToken = await retrieveToken(false);

    if (!refreshToken) {
        await handleLogoutAndResetState(setAuthState, handleClearWatch);
        return Promise.reject(new Error('No refresh token available'));
    }

    try {
        const { data } = await api.post('/authenticate/refresh-token', {}, {
            headers: Platform.OS === "android" ? { Cookie: `refreshToken=${refreshToken}` } : {},
            withCredentials: true,
        });

        const { accessToken, refreshToken: newRefreshToken } = data;

        await storeToken(accessToken, true);
        await storeToken(newRefreshToken, false);

        originalRequest._retry = true;
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

        return api(originalRequest);
    } catch (refreshError) {
        await handleLogoutAndResetState(setAuthState, handleClearWatch);
        return Promise.reject(refreshError);
    }
}

export function initializeApi({ setAuthState, handleClearWatch }: InitializeApiParams) {
    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const { response, config: originalRequest } = error;

            if (!response) return Promise.reject(error);

            const { status, data } = response;

            const nonRetryStatusCodes = [
                StatusCode.InvalidCredentials,
                StatusCode.UserNotFound,
                StatusCode.AccountNotConfirmed,
                StatusCode.CaptchaError,
                StatusCode.DigiDJwkError,
                StatusCode.DigiDBsnError,
                StatusCode.DigiDRequestError,
                StatusCode.DigiDUserDeactivated,
            ];

            if (status === StatusCode.Unauthorized && nonRetryStatusCodes.includes(data)) {
                return Promise.reject(error);
            }

            if ((status === StatusCode.Unauthorized || data === StatusCode.JwtExpired) && !originalRequest._retry) {
                return handleTokenRefresh(originalRequest, setAuthState, handleClearWatch);
            }

            return Promise.reject(error);
        }
    );
}

export default api;
