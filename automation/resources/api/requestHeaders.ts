export const commonHeaders = {
    'Accept': '*/*',
    'Content-Type': 'application/json'
};

export const cookieHeaders = {
    'Accept': '*/*',
    'Content-Type': 'application/json',
    'Cookie': 'language=nl-NL'
};

export const authHeaders = (token: string) => ({
    'Content-Type': 'application/json',
    'Accept': '*/*',
    'Authorization': 'Bearer ' + token
});