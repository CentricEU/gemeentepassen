
import AuthenticationContext, { AuthenticationStateType } from './authentication-context';
import { useContext } from 'react';
import { render } from '@testing-library/react-native';

describe('AuthenticationContext', () => {
  const initialAuthState: AuthenticationStateType = {
    accessToken: 'mock_token',
    refreshToken: null,
    authenticated: true,
    accountDeleted: false,
    error: null,
  };

  it('allows setting authentication state', () => {

    let updatedAuthState: AuthenticationStateType | null = null;

    const TestComponent = () => {
      const { authState } = useContext(AuthenticationContext);

      updatedAuthState = authState;

      return null;
    };

    render(
      <AuthenticationContext.Provider value={{ authState: initialAuthState, setAuthState: jest.fn() }}>
        <TestComponent />
      </AuthenticationContext.Provider>
    );

    expect(updatedAuthState).toEqual(initialAuthState);
  });
});
