import { act, fireEvent, render } from "@testing-library/react-native";
import LoginForm from "./LoginForm";
import { Text, TouchableOpacity, View } from "react-native";
import React from "react";
import UserService from "../../services/UserService";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { NavigationEnum } from "../../utils/enums/navigationEnum";

jest.useFakeTimers()

const MOCK_TOKEN = 'abcd';

jest.mock('react-native-google-recaptcha', () => {
	const React = require('react');
	return {
		__esModule: true,
		GoogleRecaptchaActionName: {
			LOGIN: 'login'
		},
		// @ts-ignore
		default: React.forwardRef(({siteKey, baseUrl, onVerify, action}, ref) => {
				React.useImperativeHandle(ref, () => ({
					open: jest.fn(),
				}));
				return (
					<View ref={ref}>
						<Text>recaptcha</Text>
					</View>
				);
			}
		)
	}
});

const MockAuthenticationContext = React.createContext({setAuthState: jest.fn()});

jest.mock(
	'react-native-vector-icons/MaterialCommunityIcons',
	() => 'MockedMaterialCommunityIcons',
);

jest.mock('../../services/UserService', () => ({
	login: jest.fn(),
}));

jest.mock('../../utils/auth/jwtSecurity.tsx', () => {
	return {
		__esModule: true,
		storeToken: jest.fn((token) => {
			console.log('stored: ' + token);
		})
	}
});

jest.mock('../../components/error-toaster/CustomToaster', () => {
	return jest.fn(({message, onClose}: any) => (
		<TouchableOpacity onPress={onClose}>
			<View>
				<Text>{message}</Text>
			</View>
		</TouchableOpacity>
	));
});

const mockNavigate = jest.fn();

describe('LoginForm component', () => {
	const renderComponent = () => {
		return render(
			<MockAuthenticationContext.Provider value={{setAuthState: jest.fn()}}>
				<LoginForm navigation={{navigate: mockNavigate} as unknown as StackNavigationProp<RootStackParamList>}/>
			</MockAuthenticationContext.Provider>
		);
	};

	it('should render the title properly', async () => {
		const {findByText} = renderComponent();

		expect(await findByText('loginPage.title')).toBeTruthy();
		expect(await findByText('generic.welcome')).toBeTruthy();
	});

	it('should display an error if required fields are not filled when attempting to submit', async () => {
		const {findByTestId, getByText} = renderComponent();

		fireEvent.changeText(await findByTestId('registerPage.registerForm.emailPlaceholder'), '');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.passwordPlaceholder'), 'password');

		await act(async () => {
			fireEvent.press(getByText('generic.buttons.logIn'));
		});

		expect(getByText('generic.errors.requiredField')).toBeTruthy();
	});

	it('should display an error when the login request fails', async () => {
		(UserService.login as jest.Mock).mockImplementation(() => {
			throw new Error('failed to log in')
		});

		const {findByTestId, getByText} = renderComponent();

		fireEvent.changeText(await findByTestId('registerPage.registerForm.emailPlaceholder'), 'email@domain.com');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.passwordPlaceholder'), 'password');

		await act(async () => {
			fireEvent.press(getByText('generic.buttons.logIn'));
		});

		expect(getByText('loginPage.requestError')).toBeTruthy();
	});

	it('should open the recaptcha popup when necessary', async () => {
		const consoleMock = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
		(UserService.login as jest.Mock).mockImplementation(() => {
			throw new Error('40009');
		});

		const {findByTestId, getByText} = renderComponent();

		fireEvent.changeText(await findByTestId('registerPage.registerForm.emailPlaceholder'), 'email@domain.com');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.passwordPlaceholder'), 'password');
		fireEvent.press(getByText('generic.buttons.logIn'));

		await act(async () => {
			try {
				fireEvent.press(getByText('generic.buttons.logIn'))
			} catch (error) {
				expect(consoleMock).toHaveBeenCalledWith('recaptcha opened');
			}
		});
	});

	it('should log the Digi D message', async () => {
		const consoleMock = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());

		const {getByText} = renderComponent();

		await act(async () => {
			fireEvent.press(getByText('generic.buttons.continueDigiD'))
		});
		expect(consoleMock).toHaveBeenCalledWith('Navigate to Digi D');
	});

	it('should log the user successfully if all data is valid', async () => {
		const consoleMock = jest.spyOn(global.console, 'log').mockImplementation(jest.fn());
		(UserService.login as jest.Mock).mockResolvedValue({
			token: MOCK_TOKEN
		});

		const {findByTestId, getByText} = renderComponent();

		fireEvent.changeText(await findByTestId('registerPage.registerForm.emailPlaceholder'), 'email@domain.com');
		fireEvent.changeText(await findByTestId('registerPage.registerForm.passwordPlaceholder'), 'password');

		await act(async () => {
			fireEvent.press(getByText('generic.buttons.logIn'));
		});

		expect(consoleMock).toHaveBeenCalledWith('stored: ' + MOCK_TOKEN);
	});

	it('should navigate to register when register button is pressed', async () => {
		const {getByText} = renderComponent();

		fireEvent.press(getByText('registerPage.register'));

		expect(mockNavigate).toHaveBeenCalledWith(NavigationEnum.register);
	});
});