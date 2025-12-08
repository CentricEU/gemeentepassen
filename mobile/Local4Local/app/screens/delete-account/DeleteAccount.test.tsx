import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-native-paper';
import UserService from '../../services/UserService';
import AuthenticationContext from '../../contexts/authentication/authentication-context';
import { NavigationEnum } from '../../utils/enums/navigationEnum';
import { LocationContext } from '../../contexts/location/location-provider';
import { DeleteAccount } from '../delete-account/DeleteAccount';

jest.mock('../../services/UserService');
jest.mock('../../assets/exclamation-danger.svg', () => 'ExclamationDangerIcon');
jest.mock('react-i18next', () => ({
	useTranslation: () => ({ t: (key: string) => key })
}));

describe('DeleteAccount Component', () => {
	let mockSetAuthState: jest.Mock;
	let mockHandleClearWatch: jest.Mock;

	beforeEach(() => {
		mockSetAuthState = jest.fn();
		mockHandleClearWatch = jest.fn();

		jest.spyOn(React, 'useContext').mockImplementation((context) => {
			if (context === AuthenticationContext) {
				return { setAuthState: mockSetAuthState };
			}
			if (context === LocationContext) {
				return { handleClearWatch: mockHandleClearWatch };
			}
			return null;
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	test('renders without crashing', () => {
		const navigation: any = { navigate: jest.fn() };
		const { getByText } = render(
			<Provider>
				<DeleteAccount navigation={navigation} />
			</Provider>
		);
		expect(getByText('deleteAccount.sorryMessage')).toBeTruthy();
	});

	test('handles delete account action correctly', async () => {
		const navigation: any = { navigate: jest.fn() };
		UserService.deleteAccount = jest.fn().mockResolvedValueOnce({});
		const { getByLabelText, getByText } = render(
			<Provider>
				<DeleteAccount navigation={navigation} />
			</Provider>
		);

		const reasonLabel = 'deleteAccount.reasons.noLongerUsing';
		const reasonCheckbox = getByLabelText(reasonLabel);
		fireEvent.press(reasonCheckbox);

		const deleteButton = getByText('profile.deleteAccount');
		fireEvent.press(deleteButton);

		await waitFor(() => {
			expect(mockSetAuthState).toHaveBeenCalledWith({
				accessToken: null,
				refreshToken: null,
				authenticated: false,
				error: null,
				accountDeleted: true
			});
			expect(mockHandleClearWatch).toHaveBeenCalled();
		});
	});

	test('navigates to profile screen on cancel', () => {
		const navigation: any = { navigate: jest.fn() };
		const { getByText } = render(
			<Provider>
				<DeleteAccount navigation={navigation} />
			</Provider>
		);

		const cancelButton = getByText('generic.buttons.cancel');
		fireEvent.press(cancelButton);

		expect(navigation.navigate).toHaveBeenCalledWith(NavigationEnum.profileScreen);
	});
});
