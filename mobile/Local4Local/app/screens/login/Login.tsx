import { ImageBackground, View } from "react-native";
import styles from "./LoginStyle";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { RouteProp } from '@react-navigation/native';
import LoginForm from "../../components/login-form/LoginForm";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import CustomToaster from "../../components/error-toaster/CustomToaster";
import { Portal } from "react-native-paper";
import { ToasterTypeEnum } from "../../utils/enums/toasterTypeEnum";

type GetStartedScreenProps = {
	navigation: StackNavigationProp<RootStackParamList>;
	route: RouteProp<RootStackParamList, 'Login'>;
};

export function Login({ navigation, route }: GetStartedScreenProps) {
	const { t } = useTranslation("common");

	const [requestError, setRequestError] = useState("");

	useEffect(() => {
		if (route.params?.errorCode === '40027') {
			setRequestError(t('registerPage.resendEmailError'));
		}
	}, [route.params?.errorCode]);

	const handleCloseError = () => setRequestError("");

	return (
		<ImageBackground
			source={require('../../assets/background-element.png')}
			style={{ flex: 1 }}
			resizeMode="stretch">
			<View style={styles.mainContainer} testID="mainContainer">
				<LoginForm navigation={navigation} route={route} />
				{requestError && (
					<Portal>
						<View style={styles.bottomToaster}>
							<CustomToaster
								message={requestError}
								onClose={() => handleCloseError()}
								toasterType={ToasterTypeEnum.INFO}
							/>
						</View>
					</Portal>
				)}
			</View>
		</ImageBackground>
	);
}
