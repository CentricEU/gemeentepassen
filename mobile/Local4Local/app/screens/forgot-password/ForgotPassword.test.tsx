import React from 'react';
import { render } from '@testing-library/react-native';
import { ForgotPassword } from './ForgotPassword';
import ForgotPasswordForm from '../../components/forgot-pass-form/ForgotPasswordForm';

jest.mock('../../components/forgot-pass-form/ForgotPasswordForm', () => ({
    __esModule: true,
    default: jest.fn(() => null),
}));

describe('ForgotPassword screen', () => {
    const mockNavigation = { navigate: jest.fn(), goBack: jest.fn() } as any;
    const mockRoute = { params: {} } as any;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with ImageBackground and ForgotPasswordForm', () => {
        const { getByTestId } = render(
            <ForgotPassword navigation={mockNavigation} route={mockRoute} />
        );

        const mainContainer = getByTestId('mainContainer');
        expect(mainContainer).toBeTruthy();

        expect(ForgotPasswordForm).toHaveBeenCalledWith(
            expect.objectContaining({
                navigation: mockNavigation,
                route: mockRoute,
            }),
            {}
        );
    });
});
