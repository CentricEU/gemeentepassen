import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "react-native-crypto-js";

//TO-DO decide where should we store the encription key
const encryptionKey = 'test-encryption-key';
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

const getStorageKey = (isAccessToken: boolean): string => {
	return isAccessToken ? ACCESS_TOKEN_KEY : REFRESH_TOKEN_KEY;
};

export const storeToken = async (token: string, isAccessToken: boolean) => {
	try {
		const cryptedToken = CryptoJS.AES.encrypt(token, encryptionKey).toString();
		await AsyncStorage.setItem(getStorageKey(isAccessToken), cryptedToken);
	} catch (error) {
		console.error("Error storing token:", error);
	}
};

export const retrieveToken = async (isAccessToken: boolean) => {
	try {
		const cryptedToken = await AsyncStorage.getItem(getStorageKey(isAccessToken));

		if (!cryptedToken) {
			return;
		}
		const bytes = CryptoJS.AES.decrypt(cryptedToken, encryptionKey);
		let decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
		return decryptedToken.replace(/^["]|["]$/g, '');
	} catch (error) {
		console.error("Error retrieving token:", error);
		return;
	}
};

export const clearToken = async (isAccessToken: boolean) => {
	try {
		await AsyncStorage.removeItem(getStorageKey(isAccessToken));
	} catch (error) {
		console.error("Error clearing token:", error);
	}
};


export const clearAllTokens = async () => {
	try {
		await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
	} catch (error) {
		console.error("Error clearing token:", error);
	}
};