import React, { useEffect, useState } from "react";
import AuthenticationContext, { AuthenticationStateType } from "./authentication-context";
import { retrieveToken } from "../../utils/auth/jwtSecurity";

const AuthenticationProvider = ({ children }: any) => {
  const state: AuthenticationStateType = {
    token: null,
    authenticated: false,
    accountDeleted: null
  }

  const [authState, setAuthState] = useState(state);

  useEffect(() => {
    getToken();
  }, []);
  
  const getToken = async () => {
    const token = await retrieveToken();
    const newState = {
      token: token || null,
      authenticated: !!token,
      accountDeleted: null
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
