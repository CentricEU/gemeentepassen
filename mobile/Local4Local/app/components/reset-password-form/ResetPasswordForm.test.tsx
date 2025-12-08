import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ResetPasswordForm from './ResetPasswordForm';
import UserService from '../../services/UserService';
import AuthenticationContext from '../../contexts/authentication/authentication-context';
import { PaperProvider } from 'react-native-paper';

jest.mock('../../assets/icons/email.svg', () => 'EmailIcon');

jest.mock('../../services/UserService', () => ({
    validateResetPasswordToken: jest.fn(),
    resetPassword: jest.fn(),
}));

const mockedNavigate = jest.fn();

const renderComponent = (token = 'dummy-token', authError = null) => {
  const authState = {
    accessToken: null,
    refreshToken: null,
    authenticated: false,
    accountDeleted: false,
    error: authError,
  };
  const setAuthState = jest.fn();

  return render(
    <PaperProvider>
      <AuthenticationContext.Provider value={{ authState, setAuthState }}>
        <ResetPasswordForm
          navigation={{ navigate: mockedNavigate } as any}
          route={{ params: { token } } as any}
        />
      </AuthenticationContext.Provider>
    </PaperProvider>
  );
};

describe('ResetPasswordForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', async () => {
        (UserService.validateResetPasswordToken as jest.Mock).mockResolvedValueOnce(true);

        const { getByPlaceholderText } = renderComponent();
        await waitFor(() => {
            expect(getByPlaceholderText('registerPage.registerForm.passwordPlaceholder')).toBeTruthy();
            expect(getByPlaceholderText('registerPage.registerForm.retypePasswordPlaceholder')).toBeTruthy();
        });
    });

    it('displays error when passwords do not match', async () => {
        const { getByPlaceholderText, getByText } = renderComponent();
        const passwordInput = getByPlaceholderText('registerPage.registerForm.passwordPlaceholder');
        const confirmInput = getByPlaceholderText('registerPage.registerForm.retypePasswordPlaceholder');

        fireEvent.changeText(passwordInput, 'Password123!');
        fireEvent.changeText(confirmInput, 'Different123!');

        fireEvent.press(getByText('generic.buttons.confirm'));

        await waitFor(() => {
            expect(getByText('generic.errors.passwordMatch')).toBeTruthy();
        });
    });

    it('calls resetPassword on valid input', async () => {
        (UserService.resetPassword as jest.Mock).mockResolvedValueOnce(true);

        const { getByPlaceholderText, getByText } = renderComponent();
        const passwordInput = getByPlaceholderText('registerPage.registerForm.passwordPlaceholder');
        const confirmInput = getByPlaceholderText('registerPage.registerForm.retypePasswordPlaceholder');

        fireEvent.changeText(passwordInput, 'Password123!');
        fireEvent.changeText(confirmInput, 'Password123!');

        fireEvent.press(getByText('generic.buttons.confirm'));

        await waitFor(() => {
            expect(UserService.resetPassword).toHaveBeenCalledWith(expect.objectContaining({
                password: 'Password123!',
            }));
        });
    });

    it('shows success dialog on password reset', async () => {
        (UserService.resetPassword as jest.Mock).mockResolvedValueOnce(true);

        const { getByPlaceholderText, getByText } = renderComponent();
        const passwordInput = getByPlaceholderText('registerPage.registerForm.passwordPlaceholder');
        const confirmInput = getByPlaceholderText('registerPage.registerForm.retypePasswordPlaceholder');

        fireEvent.changeText(passwordInput, 'Password123!');
        fireEvent.changeText(confirmInput, 'Password123!');

        fireEvent.press(getByText('generic.buttons.confirm'));

        await waitFor(() => {
            expect(getByText('changePassword.dialog.title')).toBeTruthy();
        });
    });
});
