import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import OfferIcon from "../../assets/icons/offer.svg";
import ScanIcon from "../../assets/icons/scan.svg";
import TransactionsIcon from "../../assets/icons/transactions.svg";
import ProfileIcon from "../../assets/icons/profile.svg";
import DiscountsIcon from "../../assets/icons/coins.svg";

import type { SvgProps } from "react-native-svg";
import { OffersStack } from "../offers/OfferScreen";
import { ScanStack } from "../scan/ScanScreen";
import { TransactionsStack } from "../transactions/TransactionScreen";
import { ProfileStack } from "../profile/ProfileScreen";
import { colors } from "../../common-style/Palette";
import { REGULAR } from "../../common-style/FontFamily";
import { useTranslation } from "react-i18next";
import OfferProvider from "../../contexts/offer/offer-provider";
import {
	CommonActions,
	NavigationContainerRef,
} from "@react-navigation/native";
import { NativeSyntheticEvent } from "react-native";
import { commonShadowStyles } from "../../common-style/CommonShadowStyle";
import { DiscountsStack } from "../discounts/DiscountsScreen";

const Tab = createBottomTabNavigator();

const screenOptions = (iconComponent: React.FC<SvgProps>, label: string) => ({
	tabBarIcon: ({ focused }: { focused: any }) =>
		React.createElement(iconComponent, {
			fill: focused ? colors.THEME_500 : colors.GREY_SCALE,
			width: 24,
			height: 24,
		}),
	tabBarLabel: label,
	tabBarLabelStyle: { fontFamily: REGULAR },
});

const tabBarOptions = {
	headerShown: false,
	tabBarActiveTintColor: colors.THEME_500,
	tabBarInactiveTintColor: colors.GREY_SCALE,
	tabBarStyle: {
		paddingTop: 4,
		borderTopWidth: 0,
		elevation: 8,
		shadowColor: colors.WHITE,
		...commonShadowStyles.shadow,
	},
};

export function Home() {
	const { t } = useTranslation("common");

	const screens = [
		{
			name: "OffersStack",
			component: OffersStack,
			options: screenOptions(OfferIcon, t("navigation.offers")),
		},
		{
			name: "ScanStack",
			component: ScanStack,
			options: screenOptions(ScanIcon, t("navigation.scan")),
		},
		{
			name: "DiscountsStack",
			component: DiscountsStack,
			options: screenOptions(DiscountsIcon, t("navigation.discounts")),
		},
		{
			name: "TransactionsStack",
			component: TransactionsStack,
			options: screenOptions(
				TransactionsIcon,
				t("navigation.transactions")
			),
		},
		{
			name: "ProfileStack",
			component: ProfileStack,
			options: screenOptions(ProfileIcon, t("navigation.profile")),
			listeners: ({
				navigation,
			}: {
				navigation: NavigationContainerRef<any>;
			}) => ({
				tabPress: (e: NativeSyntheticEvent<any>) => {
					e.preventDefault();
					navigation.dispatch(
						CommonActions.navigate({
							name: "ProfileStack",
							params: {
								screen: "Profile",
							},
						})
					);
				},
			}),
		},
	];

	return (
		<OfferProvider>
			<Tab.Navigator screenOptions={tabBarOptions}>
				{screens.map((screen: any, index: number) => (
					<Tab.Screen
						key={index}
						name={screen.name}
						component={screen.component}
						options={screen.options}
						listeners={screen.listeners}
					/>
				))}
			</Tab.Navigator>
		</OfferProvider>
	);
}
