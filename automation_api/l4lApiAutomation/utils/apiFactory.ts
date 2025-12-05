import { User } from "../serviceApi/controllers/user";
import { GetToken } from "../serviceApi/tokenApi";
import apiContext from "./apiContext";

export class ApiFactory{
    public static async getToken() : Promise<GetToken>
    {
        const context = await apiContext.getInstance();
        return new GetToken(context);
    }

    public static async getUserApi() : Promise<User>
    {
        const context = await apiContext.getInstance();
        return new User(context);
    }
}