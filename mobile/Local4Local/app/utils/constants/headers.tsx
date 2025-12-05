import { retrieveToken } from "../auth/jwtSecurity";

export const HEADERS = {
    'Content-Type': 'application/json'
};


export const AUTH_HEADER = async () => {
    let token = await retrieveToken();
    token = token?.replace(/^"(.*)"$/, '$1');

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}
