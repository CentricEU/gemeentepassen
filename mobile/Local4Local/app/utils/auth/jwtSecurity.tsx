import AsyncStorage from "@react-native-async-storage/async-storage";
import CryptoJS from "react-native-crypto-js";

//TO-DO decide where should we store the encription key
const encriptionKey = 'test-encriotion-key';

export const storeToken = async (token: string) => {
  try {
    const cryptedToken = CryptoJS.AES.encrypt(JSON.stringify(token), encriptionKey).toString();
    await AsyncStorage.setItem("jwt_token", cryptedToken);
  } catch (error) {
    console.error("Error storing token:", error);
  }
};

export const retrieveToken = async () => {
  try {

    const cryptedToken = await AsyncStorage.getItem("jwt_token");
    
    if (!cryptedToken) {
      return;
    }
    const bytes  = CryptoJS.AES.decrypt(cryptedToken, encriptionKey);
    let decryptedToken = bytes.toString(CryptoJS.enc.Utf8);
    return decryptedToken.replace(/^["]|["]$/g, '');
  } catch (error) {
    console.error("Error retrieving token:", error);
    return;
  }
};

export const clearToken = async () => {
  try {
    await AsyncStorage.removeItem("jwt_token");
  } catch (error) {
    console.error("Error clearing token:", error);
  }
};
