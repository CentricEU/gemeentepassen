import test, { expect } from "@playwright/test";
import { User } from "../serviceApi/controllers/user";
import { ApiFactory } from "../utils/apiFactory";
import { GetToken } from "../serviceApi/tokenApi";
import { StatusCodes } from "../utils/status-codes.enum";

let userController : User;
let token: GetToken;

test.beforeAll(async() => {
    userController = await ApiFactory.getUserApi();
    token = await ApiFactory.getToken();    
});

test.describe("User Controller Tests", () => {
    test("Get User", async() => {
        const response = await userController.getUser("0a4c0246-6c82-4f11-9d66-40d43735e591");
        expect(response.status()).toBe(StatusCodes.OK);
    });

    test("Get Confirmation Account", async() => {
        const response = await userController.getConfirmAccount(process.env.TOKEN);
        expect(response.status()).toBe(StatusCodes.OK);
    });
});