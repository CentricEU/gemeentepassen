import { createContext } from "react";
import { CitizenProfileDto } from "../../utils/models/CitizenProfileDto";

export type AuthenticationStateType = {
  accessToken: string | null;
  refreshToken: string | null;
  authenticated: boolean | null;
  accountDeleted: boolean | null;
  profile?: CitizenProfileDto;
  error: string | null;
};

type AuthenticationContextType = {
  authState: AuthenticationStateType;
  setAuthState: (state: AuthenticationStateType) => void;
};

const AuthenticationContext = createContext<AuthenticationContextType>({
  authState: { accessToken: null, refreshToken: null, authenticated: null, accountDeleted: null, error: null },
  setAuthState: (state: AuthenticationStateType) => { },
});

export default AuthenticationContext;
