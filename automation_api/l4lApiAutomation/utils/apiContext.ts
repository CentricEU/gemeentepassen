import { APIRequestContext, request } from "@playwright/test";
import config from "../playwright.config";

class ApiContext {
    private static instance: APIRequestContext;

    private constructor(){}

    public static async getInstance(): Promise<APIRequestContext> {
        return ApiContext.instance ??= await request.newContext({          
            baseURL: config.use?.baseURL,
            extraHTTPHeaders: config.use?.extraHTTPHeaders
        });
    } 
}

export default ApiContext;