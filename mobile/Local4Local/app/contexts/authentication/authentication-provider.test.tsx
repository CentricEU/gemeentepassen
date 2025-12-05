import React from 'react';
import { render, act } from '@testing-library/react-native';
import AuthenticationProvider from './authentication-provider';
import { retrieveToken } from '../../utils/auth/jwtSecurity';
import AuthenticationContext from './authentication-context';


jest.mock('../../utils/auth/jwtSecurity');

describe('AuthenticationProvider', () => {
  it('sets authState correctly when token exists', async () => {
    (retrieveToken as jest.Mock).mockImplementation(() => Promise.resolve('mock_token'));

    let renderedAuthState: any;

    render(
      <AuthenticationProvider>
        <TestComponent />
      </AuthenticationProvider>
    );

    function TestComponent() {
      const { authState } = React.useContext(AuthenticationContext);
      renderedAuthState = authState; 
      return null;
    }

    await act(async () => {
      expect(retrieveToken).toHaveBeenCalledTimes(1);
    });

    expect(renderedAuthState).toEqual({
      token: 'mock_token',
      authenticated: true,
      accountDeleted: null
    });
  });

  it('sets authState correctly when token does not exist', async () => {
    (retrieveToken as jest.Mock).mockImplementation(() => Promise.resolve(null));

    let renderedAuthState: any;

    render(
      <AuthenticationProvider>
        <TestComponent />
      </AuthenticationProvider>
    );

    function TestComponent() {
      const { authState } = React.useContext(AuthenticationContext);
      renderedAuthState = authState; 
      return null;
    }

    await act(async () => {
      expect(retrieveToken).toHaveBeenCalledTimes(2); 
    });

    expect(renderedAuthState).toEqual({
      token: null,
      authenticated: false,
      accountDeleted: null
    });
  });
});
