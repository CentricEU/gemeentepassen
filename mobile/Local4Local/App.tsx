//import { enableLatestRenderer } from 'react-native-maps';
import { NavigationContainer } from '@react-navigation/native';
import { Home } from './app/screens/home/HomeTabs';
import { Landing } from './app/screens/landing/Landing';
import { StatusBar } from 'react-native';
import { StackNavigationProp, createStackNavigator } from '@react-navigation/stack';
import { Register } from './app/screens/register/Register';
import { Login } from './app/screens/login/Login';
import { useContext, useEffect } from 'react';
import AuthenticationContext from './app/contexts/authentication/authentication-context';
import { DefaultTheme } from 'react-native-paper';
import { colors } from './app/common-style/Palette';
import LoadingIndicator from './app/components/loader/LoadingIndicator';
import { DeleteAccountSuccess } from './app/screens/delete-account-success/DeleteAccountSuccess';
import { RefreshProvider } from './app/contexts/pull-to-refresh/refresh-provider';
import { initializeApi } from './app/utils/auth/api-interceptor';
import { LocationContext } from './app/contexts/location/location-provider';
import { checkLocationPermission } from './app/utils/permissions';
import { useTranslation } from 'react-i18next';
import { ForgotPassword } from './app/screens/forgot-password/ForgotPassword';
import { ResetPassword } from './app/screens/ResetPassword/ResetPassword';

//enableLatestRenderer();

export type RootStackParamList = {
	DeleteAccountSuccess: undefined;
	Home: undefined;
	Landing: undefined;
	GetStarted: undefined;
	Login: { errorCode?: string };
	Register: undefined;
	ForgotPassword: undefined;
	ResetPassword: { token: string };
};

const theme: any = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		background: colors.GREY_SCALE_O
	}
};

const Stack = createStackNavigator<RootStackParamList>();

let navigation: StackNavigationProp<RootStackParamList>;

export default function App() {
	const { authState } = useContext(AuthenticationContext);
	const { t } = useTranslation('common');
	const { setAuthState } = useContext(AuthenticationContext);
	const { handleClearWatch } = useContext(LocationContext);

	useEffect(() => {
		initializeApi({ setAuthState, handleClearWatch });
		const initPermissions = async () => {
			const status = await checkLocationPermission(t);
		};

		initPermissions();
	}, [setAuthState, handleClearWatch]);

	const linking = {
		prefixes: ['localforlocal//', 'https://citizen.testing.gemeentepassen.eu/'],
		config: {
			screens: {
				DeleteAccountSuccess: 'DeleteAccountSuccess',
				Landing: 'Landing',
				Register: 'Register',
				Login: 'Login',
				Home: 'Home',
				ForgotPassword: 'ForgotPassword',
				ResetPassword: 'recover/reset-password/:token'
			}
		}
	};

	return (
		<>
			<RefreshProvider>
				<LoadingIndicator />
				<StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
				<NavigationContainer linking={linking} theme={theme}>
					<Stack.Navigator screenOptions={{ headerShown: false }}>
						{!authState.authenticated ? (
							<>
								{authState.accountDeleted && (
									<Stack.Screen name={'DeleteAccountSuccess'} component={DeleteAccountSuccess} />
								)}

								{authState.error ? (
									<>
										<Stack.Screen name={'Login'} component={Login} />
										<Stack.Screen name={'Register'} component={Register} />
										<Stack.Screen name={'Landing'} component={Landing} />
									</>
								) : (
									<>
										<Stack.Screen name={'Landing'} component={Landing} />
										<Stack.Screen name={'Register'} component={Register} />
										<Stack.Screen name={'Login'} component={Login} />
										<Stack.Screen name={'ForgotPassword'} component={ForgotPassword} />
										<Stack.Screen name="ResetPassword" component={ResetPassword} />
									</>
								)}
							</>
						) : (
							<>
								<Stack.Screen name={'Home'} component={Home} />
							</>
						)}
					</Stack.Navigator>
				</NavigationContainer>
			</RefreshProvider>
		</>
	);
}
