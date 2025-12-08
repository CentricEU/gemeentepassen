import React from 'react';
import { render } from '@testing-library/react-native';
import { ResetPassword } from './ResetPassword';
import ResetPasswordForm from '../../components/reset-password-form/ResetPasswordForm';

jest.mock('../../components/reset-password-form/ResetPasswordForm', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));

describe('ResetPassword screen', () => {
    const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() } as any;
    const mockRoute = { params: { token: 'dummy-token' } } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with ImageBackground and ResetPasswordForm', () => {
        const { getByTestId } = render(
            <ResetPassword navigation={mockNavigation} route={mockRoute} />
        );

        const mainContainer = getByTestId('mainContainer');
        expect(mainContainer).toBeTruthy();

        expect(ResetPasswordForm).toHaveBeenCalledWith(
            expect.objectContaining({
                navigation: mockNavigation,
                route: mockRoute,
            }),
            {}
        );
    });
});
