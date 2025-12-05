import { Dimensions, ImageBackground, ScrollView, View } from "react-native";
import styles from "./LandingStyle";
import GenericButton from "../../components/generic-button/GenericButton";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../App";
import { Text } from "react-native-paper";
import { ButtonTypeEnum } from "../../utils/enums/buttonTypeEnum";
import { useTranslation } from "react-i18next";
import LandingIllustration from "../../assets/landing_illustration.svg";
import { useState } from "react";
import { NavigationEnum } from "../../utils/enums/navigationEnum";

type LandingScreenProps = {
	navigation: StackNavigationProp<RootStackParamList>;
};

export function Landing({ navigation }: LandingScreenProps) {
	const { t } = useTranslation('common');
	const [enableScroll, setEnableScroll] = useState(false);
	const [isScrollComputed, setIsScrollComputed] = useState(false);

	const computeScroll = (height: number) => {
		setIsScrollComputed(true);
		setEnableScroll(height > Dimensions.get("window").height);
	}

	const navigateToRegister = (): void => {
		navigation.navigate(NavigationEnum.register);
	}

	const navigateToLogin = (): void => {
		navigation.navigate(NavigationEnum.login, { errorCode: "" });
	}

	return (
		<ImageBackground
			source={require('../../assets/background-element.png')}
			style={{ flex: 1 }}
			resizeMode="stretch">
			<ScrollView
				onContentSizeChange={(w, h) => {
					if (isScrollComputed) {
						return;
					}
					computeScroll(h);
				}}
				scrollEnabled={enableScroll}>
				<View style={[styles.container, enableScroll && { paddingTop: 8, gap: 32 }]}>
					<View style={styles.welcomeContainer}>
						<LandingIllustration />
						<View style={styles.welcomeText}>
							<Text style={styles.welcomeTitle}>
								{t('landingPage.title')}
							</Text>
							<Text style={styles.welcomeDescription}>
								{t('landingPage.description')}
							</Text>
						</View>
					</View>
					<View style={styles.buttonContainer}>
						<GenericButton
							type={ButtonTypeEnum.primary}
							text="generic.buttons.register"
							onPressHandler={navigateToRegister}
						/>
						<GenericButton
							type={ButtonTypeEnum.secondary}
							text="generic.buttons.logIn"
							onPressHandler={navigateToLogin}
						/>
					</View>
				</View>
			</ScrollView>
		</ImageBackground>
	);
}
