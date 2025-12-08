import { retrieveToken } from "../auth/jwtSecurity";


export const getLanguageCookieHeader = (language: string): Record<string, string> => {
    const normalizedLangMap: Record<string, string> = {
        nl: "nl-NL",
        en: "en-US",
    };

    const currentLang = language || "en";
    const normalizedLanguage = normalizedLangMap[currentLang] || "nl-NL";

    return { "Accept-Language": normalizedLanguage };
};

export const HEADERS = {
    'Content-Type': 'application/json'
};

export const AUTH_HEADER = async () => {
    let token = await retrieveToken(true);
    token = token?.replace(/^"(.*)"$/, '$1');

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}