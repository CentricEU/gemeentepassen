import BaseApi from "./baseApi";

export class GetToken extends BaseApi{

    async getAccessToken(){
        const data ={
            username: process.env.EMAIL,
            password: process.env.PASSWORD,
            role:process.env.ROLE,
            reCaptchaResponse: "",
            rememberMe: true
        }
        const response = await this.post('authenticate', data);
        return response;
    }
}