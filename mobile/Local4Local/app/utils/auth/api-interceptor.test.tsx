import MockAdapter from 'axios-mock-adapter';
import api, { initializeApi } from './api-interceptor';
import {retrieveToken, storeToken } from './jwtSecurity';
import { StatusCode } from '../enums/statusCode.enum';

jest.mock('./jwtSecurity', () => ({
    clearAllTokens: jest.fn(),
    retrieveToken: jest.fn(),
    storeToken: jest.fn(),
}));

describe('api-interceptor', () => {
    let mock: MockAdapter;
    let setAuthState: jest.Mock;
    let handleClearWatch: jest.Mock;

    beforeEach(() => {
        mock = new MockAdapter(api);
        setAuthState = jest.fn();
        handleClearWatch = jest.fn();
        initializeApi({ setAuthState, handleClearWatch });
    });

    afterEach(() => {
        mock.reset();
        jest.clearAllMocks();
    });

    it('should handle unauthorized error and refresh token', async () => {
        const accessToken = 'newAccessToken';
        const refreshToken = 'newRefreshToken';
        (retrieveToken as jest.Mock).mockResolvedValueOnce('testRefreshToken');

        mock.onPost('/authenticate/refresh-token').reply(StatusCode.Ok, { accessToken, refreshToken });
        mock.onGet('/test').replyOnce(401).onGet('/test').reply(StatusCode.Ok);

        await api.get('/test');


        expect(retrieveToken).toHaveBeenCalledWith(false);
        expect(storeToken).toHaveBeenCalledWith(accessToken, true);
        expect(storeToken).toHaveBeenCalledWith(refreshToken, false);
        expect(mock.history.post.length).toBeGreaterThan(0);
        expect(mock.history.get.length).toBeGreaterThan(1);
        expect(mock.history.get[1]?.headers?.['Authorization']).toBe(`Bearer ${accessToken}`);
    });

});
