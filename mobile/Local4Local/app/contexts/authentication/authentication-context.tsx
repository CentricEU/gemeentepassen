import { createContext } from "react";
import { CitizenProfileDto } from "../../utils/models/CitizenProfileDto";

export type AuthenticationStateType = {
  token: string | null;
  authenticated: boolean | null;
  accountDeleted: boolean | null;
  profile?: CitizenProfileDto
};

type AuthenticationContextType = {
  authState: AuthenticationStateType;
  setAuthState: (state: AuthenticationStateType) => void;
};

const AuthenticationContext = createContext<AuthenticationContextType>({
  authState: { token: null, authenticated: null, accountDeleted: null },
  setAuthState: (state: AuthenticationStateType) => { },
});

export default AuthenticationContext;
