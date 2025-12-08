import { useEffect, useState } from "react";
import AuthenticationContext, { AuthenticationStateType } from "./authentication-context";
import { retrieveToken } from "../../utils/auth/jwtSecurity";

const AuthenticationProvider = ({ children }: any) => {
    const state: AuthenticationStateType = {
        accessToken: null,
        refreshToken: null,
        authenticated: false,
        accountDeleted: null,
        error: null
    }

    const [authState, setAuthState] = useState(state);

    useEffect(() => {
        getToken();
    }, []);

    const getToken = async () => {
        const accessToken = await retrieveToken(true);
        const refreshToken = await retrieveToken(false);
        const newState = {
            accessToken: accessToken || null,
            refreshToken: refreshToken || null,
            authenticated: !!accessToken,
            accountDeleted: null,
            error: null,
        };
        setAuthState(newState);
    };

    return (
        <AuthenticationContext.Provider value={{ authState, setAuthState }}>
            {children}
        </AuthenticationContext.Provider>
    );
};

export default AuthenticationProvider;
