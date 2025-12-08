import { SafeAreaView, Text, View } from "react-native";
import Stack from "../../navigations/StackNavigator";
import { headerOptions } from "../../components/header/GlobalHeader";
import style from "./ProfileStyle";
import { Divider, Portal } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { clearAllTokens } from "../../utils/auth/jwtSecurity";
import { useCallback, useContext, useEffect, useState } from "react";
import AuthenticationContext from "../../contexts/authentication/authentication-context";
import ButtonWithArrow from "../../components/button-with-arrow/ButtonWithArrow";
import UserService from "../../services/UserService";
import { CitizenProfileDto } from "../../utils/models/CitizenProfileDto";
import LogoutIcon from '../../assets/icons/logout.svg'
import { colors } from "../../common-style/Palette";
import GenericDrawer from "../../components/generic-drawer/GenericDrawer";
import GenericButton from "../../components/generic-button/GenericButton";
import { ButtonTypeEnum } from "../../utils/enums/buttonTypeEnum";
import { NavigationEnum } from "../../utils/enums/navigationEnum";
import { ChangeLanguage } from "../change-language/ChangeLanguage";
import { DeleteAccount } from "../delete-account/DeleteAccount";
import common from "../../common-style/CommonStyle";
import { LocationContext } from "../../contexts/location/location-provider";
import { ScrollView } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";
import { PersonalInformation } from "../personal-information/PersonalInformation";

export function Profile({ navigation }: { navigation: any }) {
	const { authState, setAuthState } = useContext(AuthenticationContext);

	const { handleClearWatch } = useContext(LocationContext);

	const { t } = useTranslation('common');
	const [citizenProfile, setCitizenProfile] = useState<any>(null);
	const [displayLogoutDrawer, setDisplayLogoutDrawer] = useState<any>(false);

	useEffect(() => {
		getCitizenProfile();
	}, []);

	useEffect(() => {
		setCitizenProfile(authState.profile);
	}, [authState.profile]);

	const getCitizenProfile = async () => {
		try {
			const profile: CitizenProfileDto = await UserService.getCitizenProfile();
			setCitizenProfile(profile);
		} catch (error) {
			console.error(error);
		}
	};

	const onLogout = async () => {
		await clearAllTokens();
		const newState = { accessToken: null, refreshToken: null, authenticated: false, accountDeleted: false, error: null };
		setAuthState(newState);
		handleClearWatch();
	};

	useFocusEffect(
		useCallback(() => {
			return () => {
				if (!displayLogoutDrawer) {
					return;
				}
				setDisplayLogoutDrawer(false);
			};
		}, [displayLogoutDrawer])
	);

	const onCloseDrawer = () => setDisplayLogoutDrawer(false);

	const onCancelLogout = () => setDisplayLogoutDrawer(false);

	const handleLogout = () => setDisplayLogoutDrawer(true);
	const handlePersonalInfo = () => navigation.navigate(NavigationEnum.personalInfo);
	const handleChangePassword = () => console.log("Should Implement");
	const handleCommunicationPref = () => console.log("Should Implement");
	const handleDeleteAccount = () => navigation.navigate(NavigationEnum.deleteAccount);
	const handleMyCode = () => console.log("Should Implement");
	const handleChangeLanguage = () => navigation.navigate(NavigationEnum.changeLanguage);

	const buttonConfigurations = [
		{
			onPressHandler: handlePersonalInfo,
			icon: "account",
			text: "profile.personalInfo"
		},
		// {
		// 	onPressHandler: handleMyCode,
		// 	icon: "barcode-scan",
		// 	text: "profile.myCode"
		// },
		// {
		// 	onPressHandler: handleChangePassword,
		// 	icon: "lock-reset",
		// 	text: "profile.changePassword"
		// },
		{
			onPressHandler: handleChangeLanguage,
			icon: "earth",
			text: "profile.changeLanguage"
		},
		// {
		// 	onPressHandler: handleCommunicationPref,
		// 	icon: "chat",
		// 	text: "profile.communicationPref"
		// }
	];

	return (
		<SafeAreaView style={style.container}>

			<ScrollView style={style.container} contentContainerStyle={style.contentContainer}>
				{citizenProfile && <View style={style.informationContainer} testID="user-info-container-id"
				>
					<Text style={style.name}>{`${citizenProfile.firstName} ${citizenProfile.lastName}`}</Text>
				</View>}
				<View style={style.buttonsContainer}>
					{buttonConfigurations.map((buttonProps, index) => (
						<ButtonWithArrow
							key={buttonProps.text + index}
							onPressHandler={buttonProps.onPressHandler}
							icon={buttonProps.icon}
							text={buttonProps.text}
						></ButtonWithArrow>))
					}

					<Divider style={common.flexDivider} />

					<ButtonWithArrow
						onPressHandler={handleLogout}
						testID="logoutButtonId"
						customSvg={<LogoutIcon fill={colors.GREY_SCALE} height={24} />}
						text="profile.logout"
					></ButtonWithArrow>

					<ButtonWithArrow
						onPressHandler={handleDeleteAccount}
						icon="delete"
						text="profile.deleteAccount"
					></ButtonWithArrow>
				</View>

			</ScrollView>

			<Portal>
				<GenericDrawer
					visible={displayLogoutDrawer}
					description={t("profile.logoutModal.description")}
					title={t("profile.logoutModal.title")}
					onClose={onCloseDrawer}
					buttons={[
						<GenericButton
							type={ButtonTypeEnum.danger}
							text="profile.logout"
							key="logout"
							onPressHandler={onLogout}
						/>,
						<GenericButton
							type={ButtonTypeEnum.secondary}
							text="generic.buttons.cancel"
							key="cancel"
							onPressHandler={onCancelLogout}
						/>
					]}
				/>
			</Portal>
		</SafeAreaView>
	);
}

export function ProfileStack({ }: { navigation: any }) {
	const { t } = useTranslation("common");

	return (
		<Stack.Navigator
			screenOptions={{
				...headerOptions,
			}}
		>
			<Stack.Screen
				name="Profile"
				component={Profile}
				options={{
					title: t("navigation.profile"),
				}}
			/>

			<Stack.Screen
				name={NavigationEnum.changeLanguage}
				component={ChangeLanguage}
				options={{
					title: t("profile.changeLanguage"),
					headerRight: () => null,
					headerTitleContainerStyle: style.headerTitleContainer
				}}
			/>

			<Stack.Screen
				name={NavigationEnum.personalInfo}
				component={PersonalInformation}
				options={{
					title: t("profile.personalInfo"),
					headerRight: () => null,
					headerTitleContainerStyle: style.headerTitleContainer
				}}
			/>

			<Stack.Screen
				name={NavigationEnum.deleteAccount}
				component={DeleteAccount}
				options={{
					title: t("profile.deleteAccount"),
					headerRight: () => null,
					headerTitleContainerStyle: style.headerTitleContainer
				}}
			/>
		</Stack.Navigator>
	);
}
