import { APIResponse } from "@playwright/test";
import BaseApi from "../baseApi";

export class User extends BaseApi{
    
    async getUser(id : string) : Promise<APIResponse>{
        return this.get('user', {userId: id})
    }

    async getConfirmAccount(token? : string) : Promise<APIResponse>{
        return this.get(`user/confirm-account/${token}`)
    }
}