import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DeleteAccountSuccess } from './DeleteAccountSuccess'; // Adjust the import path as necessary

// Mocking react-i18next useTranslation hook
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key: string) => key }),
}));

// Mocking any icons or other components
jest.mock("../../assets/icons/checked-illustration.svg", () => "CheckedIllustration");

describe('<DeleteAccountSuccess />', () => {
    it('renders correctly', () => {
        const navigation: any = { navigate: jest.fn() };
        const { getByText } = render(<DeleteAccountSuccess navigation={navigation} />);
        expect(getByText('deleteAccount.successfullyDeleted')).toBeTruthy();
        expect(getByText('deleteAccount.successfullyDeletedMessage')).toBeTruthy();
        expect(getByText('generic.buttons.done')).toBeTruthy();
        expect(getByText('generic.buttons.createNewAccount')).toBeTruthy();
    });

    it('navigates to landing on "Done" button press', () => {
        const navigation: any = { navigate: jest.fn() };
        const { getByText } = render(<DeleteAccountSuccess navigation={navigation} />);
        fireEvent.press(getByText('generic.buttons.done'));
        expect(navigation.navigate).toHaveBeenCalledWith('Landing');
    });

    it('navigates to register on "Create New Account" button press', () => {
        const navigation: any = { navigate: jest.fn() };
        const { getByText } = render(<DeleteAccountSuccess navigation={navigation} />);
        fireEvent.press(getByText('generic.buttons.createNewAccount'));
        expect(navigation.navigate).toHaveBeenCalledWith('Register');
    });
});

