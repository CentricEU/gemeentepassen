import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ForgotPasswordForm from './ForgotPasswordForm';
import AuthenticationContext from '../../contexts/authentication/authentication-context';
import UserService from '../../services/UserService';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('../../services/UserService', () => ({
    forgotPassword: jest.fn(),
}));

jest.mock('react-native-google-recaptcha', () => {
  const React = require('react');
  return {
    __esModule: true,
    GoogleRecaptchaActionName: {
      PASSWORD_RESET: 'PASSWORD_RESET',
    },
    default: React.forwardRef((props: any, ref: any) => {
      React.useImperativeHandle(ref, () => ({
        open: () => {
          props.onVerify && props.onVerify('captcha-token');
        },
      }));
      return <React.Fragment />;
    }),
  };
});


const renderComponent = (authError: string | null = null) => {
    const authState = {
        accessToken: null,
        refreshToken: null,
        authenticated: false,
        accountDeleted: false,
        error: authError,
    };
    const setAuthState = jest.fn();

    return render(
        <NavigationContainer>
            <PaperProvider>
                <AuthenticationContext.Provider value={{ authState, setAuthState }}>
                    <ForgotPasswordForm navigation={{ navigate: jest.fn() } as any} route={{ params: {} } as any} />
                </AuthenticationContext.Provider>
            </PaperProvider>
        </NavigationContainer>
    );
};

describe('ForgotPasswordForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        const { getByPlaceholderText, getByText } = renderComponent();
        expect(getByPlaceholderText('forgotPassword.emailPlaceholder')).toBeTruthy();
        expect(getByText('forgotPassword.send')).toBeTruthy();
    });

    it('displays required error for empty email', async () => {
        const { getByText, getByPlaceholderText } = renderComponent();
        const emailInput = getByPlaceholderText('forgotPassword.emailPlaceholder');

        fireEvent(emailInput, 'blur');

        await waitFor(() => {
            expect(getByText('generic.errors.requiredField')).toBeTruthy();
        });
    });

    it('displays invalid email error', async () => {
        const { getByText, getByPlaceholderText } = renderComponent();
        const emailInput = getByPlaceholderText('forgotPassword.emailPlaceholder');
        fireEvent.changeText(emailInput, 'invalid-email');

        const sendButton = getByText('forgotPassword.send');
        fireEvent.press(sendButton);

        await waitFor(() => {
            expect(getByText('generic.errors.invalidEmail')).toBeTruthy();
        });
    });

    it('calls UserService.forgotPassword on valid input', async () => {
        (UserService.forgotPassword as jest.Mock).mockResolvedValueOnce(true);

        const { getByText, getByPlaceholderText } = renderComponent();
        const emailInput = getByPlaceholderText('forgotPassword.emailPlaceholder');
        fireEvent.changeText(emailInput, 'test@example.com');

        const sendButton = getByText('forgotPassword.send');
        fireEvent.press(sendButton);

        await waitFor(() => {
            expect(UserService.forgotPassword).toHaveBeenCalledWith(
                expect.objectContaining({
                    email: 'test@example.com',
                    reCaptchaResponse: 'captcha-token',
                    role: 'ROLE_CITIZEN',
                })
            );
        });

    });

});

