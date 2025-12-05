/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { DefaultTheme, PaperProvider } from "react-native-paper";
import { colors } from "./app/common-style/Palette";
import { I18nextProvider } from "react-i18next";
import i18n from './i18n';
import AuthenticationProvider from "./app/contexts/authentication/authentication-provider";
import BankHolidaysProvider from "./app/contexts/bank-holidays/bank-holidays-provider"
import { LocationProvider } from './app/contexts/location/location-provider';

const theme = {
	...DefaultTheme,
	colors: {
		...DefaultTheme.colors,
		primary: colors.GREY_SCALE,
		error: colors.DANGER_400,
		onSurface: colors.GREY_SCALE_7
	},
};

export default function Main() {
	return (
		<AuthenticationProvider>
			<BankHolidaysProvider>
				<PaperProvider theme={theme}>
					<I18nextProvider i18n={i18n} defaultNS={'translation'}>
						<LocationProvider>
							<App />
						</LocationProvider>
					</I18nextProvider>
				</PaperProvider>
			</BankHolidaysProvider>
		</AuthenticationProvider>
	);
}

AppRegistry.registerComponent(appName, () => Main);
