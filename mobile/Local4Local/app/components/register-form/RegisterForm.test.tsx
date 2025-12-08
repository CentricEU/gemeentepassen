import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import RegisterForm from './RegisterForm';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../../../App';
import { RouteProp } from '@react-navigation/native';
import UserService from '../../services/UserService';
import { CitizenRegisterDto } from '../../utils/models/CitizenRegisterDto';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import { NavigationEnum } from '../../utils/enums/navigationEnum';

jest.useFakeTimers();

const MockAuthenticationContext = React.createContext({ setAuthState: jest.fn() });

const mockNavigation = {
	navigate: jest.fn(),
	addListener: jest.fn().mockImplementation((event, callback) => {
		callback();
		return jest.fn();
	})
};

const mockRoute = (hasPass: boolean) => {
	return {
		params: {
			hasPass
		}
	};
};

jest.mock('../../services/UserService', () => ({
	registerUser: jest.fn(),
	resendConfirmationToken: jest.fn()
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'MockedMaterialCommunityIcons');

jest.mock('../generic-dialog/GenericDialog', () => {
	return jest.fn(({ visible, description, title, buttonText, onButtonPress }: any) => (
		<View>
			{visible ? (
				<>
					<Text>{title}</Text>
					<Text>{description}</Text>
					<Pressable onPress={onButtonPress}>
						<Text>{buttonText}</Text>
					</Pressable>
				</>
			) : null}
		</View>
	));
});

jest.mock('../../components/error-toaster/CustomToaster', () => {
	return jest.fn(({ message, onClose }: any) => (
		<TouchableOpacity onPress={onClose}>
			<View testID={'error-toaster'}>
				<Text>{message}</Text>
			</View>
		</TouchableOpacity>
	));
});

jest.mock('react-native-paper', () => {
	const actualPaper = jest.requireActual('react-native-paper');
	return {
		...actualPaper,
		TextInput: {
			...actualPaper.TextInput,
			Icon: ({ icon, onPressIn, onPressOut }: any) => (
				<button data-testid="eye-icon" onMouseDown={onPressIn} onMouseUp={onPressOut}>
					{icon}
				</button>
			)
		}
	};
});

describe('RegisterForm component', () => {
	beforeAll(() => {
		jest.useFakeTimers();
	});

	const renderComponent = (hasPass: boolean) => {
		return render(
			<MockAuthenticationContext.Provider value={{ setAuthState: jest.fn() }}>
				<RegisterForm
					navigation={mockNavigation as unknown as StackNavigationProp<RootStackParamList, 'Register'>}
					route={mockRoute(hasPass) as unknown as RouteProp<RootStackParamList, 'Register'>}
				/>
			</MockAuthenticationContext.Provider>
		);
	};

	it('should render the title properly', async () => {
		const { findByText } = renderComponent(false);

		expect(await findByText('registerPage.createAccount')).toBeTruthy();
		expect(await findByText('registerPage.createAccountDescription')).toBeTruthy();
	});

	it('should resend the email if the resend button is pressed', async () => {
		const { findByTestId, findByText } = renderComponent(false);

		fireEvent.changeText(await findByTestId('registerPage.registerForm.firstNamePlaceholder'), 'First Name');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.lastNamePlaceholder'), 'Last Name');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.passIdPlaceholder'), 'dadsa');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.emailPlaceholder'), 'email@domain.com');
		fireEvent.press(await findByTestId('registerPage.registerForm.termsAcceptedCheckbox'));

		fireEvent.press(await findByText('generic.buttons.continue'));

		fireEvent.changeText(await findByTestId('registerPage.registerForm.passwordPlaceholder'), 'Password12!');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.retypePasswordPlaceholder'), 'Password12!');

		fireEvent.press(await findByText('generic.buttons.createAccount'));
		fireEvent.press(await findByText('registerPage.registrationDialog.buttonText'));

		expect(UserService.resendConfirmationToken).toHaveBeenCalledWith('email@domain.com');
	});

	it('should successfully register when all data is valid', async () => {
		const { findByTestId, findByText } = renderComponent(false);

		fireEvent.changeText(await findByTestId('registerPage.registerForm.firstNamePlaceholder'), 'First Name');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.lastNamePlaceholder'), 'Last Name');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.passIdPlaceholder'), '12345678');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.emailPlaceholder'), 'email@domain.com');
		fireEvent.press(await findByTestId('registerPage.registerForm.termsAcceptedCheckbox'));

		fireEvent.press(await findByText('generic.buttons.continue'));

		fireEvent.changeText(await findByTestId('registerPage.registerForm.passwordPlaceholder'), 'Password123!');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.retypePasswordPlaceholder'), 'Password123!');

		fireEvent.press(await findByText('generic.buttons.createAccount'));
		fireEvent.press(await findByText('registerPage.registrationDialog.buttonText'));

		expect(UserService.registerUser).toHaveBeenCalledWith(
			new CitizenRegisterDto(
				'email@domain.com',
				'First Name',
				'Last Name',
				'Password123!',
				'Password123!',
				'12345678'
			),
			'en'
		);
	});

	test.each([
		{ errorCode: '40005', expectedMessageKey: 'registerPage.uniqueEmailError' },
		{ errorCode: '40035', expectedMessageKey: 'registerPage.passnumberAlreadyUsedOrInvalid' }
	])(
		'should display the appropriate error message if the register request fails with error code %s',
		async ({ errorCode, expectedMessageKey }) => {
			const mockError = {
				response: {
					data: errorCode
				}
			};

			(UserService.registerUser as jest.Mock).mockRejectedValue(mockError);

			const { findByTestId, findByText } = renderComponent(false);

			fireEvent.changeText(await findByTestId('registerPage.registerForm.emailPlaceholder'), 'email@domain.com');
			fireEvent.changeText(await findByTestId('registerPage.registerForm.firstNamePlaceholder'), 'First Name');
			fireEvent.changeText(await findByTestId('registerPage.registerForm.lastNamePlaceholder'), 'Last Name');
			fireEvent.changeText(await findByTestId('registerPage.registerForm.passIdPlaceholder'), '12345678');
			fireEvent.press(await findByTestId('registerPage.registerForm.termsAcceptedCheckbox'));

			fireEvent.press(await findByText('generic.buttons.continue'));

			fireEvent.changeText(await findByTestId('registerPage.registerForm.passwordPlaceholder'), 'Password123!');
			fireEvent.changeText(
				await findByTestId('registerPage.registerForm.retypePasswordPlaceholder'),
				'Password123!'
			);

			fireEvent.press(await findByText('generic.buttons.createAccount'));

			expect(await findByText(expectedMessageKey)).toBeTruthy();
		}
	);

	// it('should log the Digi D message', async () => {
	// 	const consoleMock = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());

	// 	const { getByText } = renderComponent(false);

	// 	await act(async () => {
	// 		fireEvent.press(getByText('generic.buttons.continueDigiD'));
	// 	});

	// 	expect(consoleMock).toHaveBeenCalledWith('Navigate to Digi D');
	// });

	it('should navigate to register when register button is pressed', async () => {
		const { getByText } = renderComponent(false);

		fireEvent.press(getByText('termsAndConditions.logIn'));

		expect(mockNavigation.navigate).toHaveBeenCalledWith(NavigationEnum.login, { errorCode: '' });
	});

	it('should redirect to login if account was already confirmed', async () => {
		const mockSuccess = (UserService.registerUser as jest.Mock).mockImplementation(jest.fn());
		const mockError = (UserService.resendConfirmationToken as jest.Mock).mockImplementation(() => {
			throw new Error('40027');
		});

		const { findByText, findByTestId } = renderComponent(false);

		fireEvent.changeText(await findByTestId('registerPage.registerForm.firstNamePlaceholder'), 'First Name');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.lastNamePlaceholder'), 'Last Name');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.passIdPlaceholder'), 'dadsa');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.emailPlaceholder'), 'email@domain.com');
		fireEvent.press(await findByTestId('registerPage.registerForm.termsAcceptedCheckbox'));

		fireEvent.press(await findByText('generic.buttons.continue'));

		fireEvent.changeText(await findByTestId('registerPage.registerForm.passwordPlaceholder'), 'Password123!');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.retypePasswordPlaceholder'), 'Password123!');

		fireEvent.press(await findByText('generic.buttons.createAccount'));
		fireEvent.press(await findByText('registerPage.registrationDialog.buttonText'));

		expect(mockNavigation.navigate).toHaveBeenCalledWith(NavigationEnum.login, { errorCode: '40027' });

		mockError.mockRestore();
		mockSuccess.mockRestore();
	});

	it('should show terms and conditions dialog when hyperlink is pressed', async () => {
		const { findByText, queryByText } = renderComponent(false);

		expect(queryByText('privacy.intro.paragraph_1')).toBeNull();

		fireEvent.press(await findByText('termsAndConditions.textDescription2'));

		expect(await findByText('privacy.intro.paragraph_1')).toBeTruthy();
	});

	it('should close terms and conditions dialog when close button is pressed', async () => {
		const { findByText, queryByText } = renderComponent(false);

		fireEvent.press(await findByText('termsAndConditions.textDescription2'));
		expect(await findByText('privacy.intro.paragraph_1')).toBeTruthy();

		fireEvent.press(await findByText('generic.buttons.close'));

		await waitFor(() => {
			expect(queryByText('privacy.intro.paragraph_1')).toBeNull();
		});
	});
});
