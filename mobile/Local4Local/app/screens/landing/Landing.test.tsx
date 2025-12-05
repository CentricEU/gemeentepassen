import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Landing } from './Landing';

// Mocking react-i18next useTranslation hook
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

jest.mock("../../assets/landing_illustration.svg", () => "Logo");

describe('<Landing />', () => {
    it('renders correctly', () => {
        const navigation: any = { navigate: jest.fn() };
        const { getByText } = render(<Landing navigation={navigation} />);
        expect(getByText('landingPage.title')).toBeTruthy();
        expect(getByText('landingPage.description')).toBeTruthy();
        expect(getByText('generic.buttons.logIn')).toBeTruthy();
    });

    it('navigates to register page', () => {
        const navigation: any = { navigate: jest.fn() };
        const { getByText } = render(<Landing navigation={navigation} />);
        fireEvent.press(getByText('generic.buttons.register'));
        expect(navigation.navigate).toHaveBeenCalledWith('Register');
    });

    it('navigates to login page', () => {
        const navigation: any = { navigate: jest.fn() };
        const { getByText } = render(<Landing navigation={navigation} />);
        fireEvent.press(getByText('generic.buttons.logIn'));
        expect(navigation.navigate).toHaveBeenCalledWith("Login", {"errorCode": ""});
    });
});
