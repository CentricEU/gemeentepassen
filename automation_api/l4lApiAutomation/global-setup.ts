import { FullConfig } from "@playwright/test";
import { ApiFactory } from "./utils/apiFactory";
import { GetToken } from "./serviceApi/tokenApi";

interface TokenResponse{
    token : string
}

async function globalSetup(config: FullConfig){
    let instance : GetToken;
    instance = await ApiFactory.getToken();
    
    const response= await instance.getAccessToken();
    const token : TokenResponse = await response.json();
    
    process.env.TOKEN = token.token;
}

export default globalSetup;
