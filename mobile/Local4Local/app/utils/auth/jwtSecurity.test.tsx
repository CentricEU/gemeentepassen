import { storeToken, retrieveToken, clearToken } from './jwtSecurity';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

jest.mock('react-native-crypto-js', () => ({
    AES: {
        encrypt: jest.fn().mockReturnValue('encryptedToken'),
        decrypt: jest.fn().mockReturnValue({
            words: [], 
            sigBytes: 0, 
            toString: jest.fn().mockReturnValue('decryptedToken')
        }),
    },
}));


describe('storeToken', () => {
    it('should store token in AsyncStorage', async () => {
        await storeToken('token');
        expect(AsyncStorage.setItem).toHaveBeenCalledWith('jwt_token', 'encryptedToken');
    });

    it('should handle error during token storage', async () => {
        const errorMessage = 'AsyncStorage error';

        (AsyncStorage.setItem as jest.MockedFunction<typeof AsyncStorage.setItem>).mockRejectedValueOnce(new Error(errorMessage));

        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

        await storeToken('token');

        expect(consoleErrorMock).toHaveBeenCalledWith('Error storing token:', new Error(errorMessage));

        consoleErrorMock.mockRestore();
    });
});

describe('retrieveToken', () => {
    it('should return undefined if no token found', async () => {
        (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>).mockResolvedValueOnce(null);

        const token = await retrieveToken();

        expect(token).toBeUndefined();
    });

    it('should return undefined if no token found', async () => {
        (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>).mockResolvedValueOnce(null);

        const token = await retrieveToken();

        expect(token).toBeUndefined();
    });

    it('should handle error during token retrieval', async () => {
        const errorMessage = 'AsyncStorage error';
        (AsyncStorage.getItem as jest.MockedFunction<typeof AsyncStorage.getItem>).mockRejectedValueOnce(new Error(errorMessage));

        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

        const token = await retrieveToken();

        expect(consoleErrorMock).toHaveBeenCalledWith('Error retrieving token:', new Error(errorMessage));
        expect(token).toBeUndefined();

        consoleErrorMock.mockRestore();
    });
    
});

describe('clearToken', () => {
    it('should clear token from AsyncStorage', async () => {
        await clearToken();
        expect(AsyncStorage.removeItem).toHaveBeenCalledWith('jwt_token');
    });

    it('should handle error during token clearing', async () => {
        const errorMessage = 'AsyncStorage error';
        (AsyncStorage.removeItem as jest.MockedFunction<typeof AsyncStorage.removeItem>).mockRejectedValueOnce(new Error(errorMessage));

        const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation();

        await clearToken();

        expect(consoleErrorMock).toHaveBeenCalledWith('Error clearing token:', new Error(errorMessage));

        consoleErrorMock.mockRestore();
    });
});
