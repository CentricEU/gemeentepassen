import React from "react";
import { BottomTabNavigationEventMap, createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import OfferIcon from "../../assets/icons/offer.svg";
import TransactionsIcon from "../../assets/icons/transactions.svg";
import ProfileIcon from "../../assets/icons/profile.svg";
import DiscountsIcon from "../../assets/icons/coins.svg";
import BenefitIcon from "../../assets/icons/benefits.svg";
import type { SvgProps } from "react-native-svg";
import { OffersStack } from "../offers/OfferScreen";
import { TransactionsStack } from "../transactions/TransactionScreen";
import { ProfileStack } from "../profile/ProfileScreen";
import { colors } from "../../common-style/Palette";
import { REGULAR } from "../../common-style/FontFamily";
import { useTranslation } from "react-i18next";
import OfferProvider from "../../contexts/offer/offer-provider";
import {
	CommonActions,
	NavigationContainerRef,
	NavigationHelpers,
	NavigationState,
	ParamListBase,
	TabActionHelpers,
	TabNavigationState,
} from "@react-navigation/native";
import { NativeSyntheticEvent } from "react-native";
import { commonShadowStyles } from "../../common-style/CommonShadowStyle";
import { DiscountsStack } from "../discounts/DiscountsScreen";
import { BenefitsStack } from "../my-benefits/MyBenefits";
import { getCurrentRouteName } from "../../utils/HelperUtils";


type Navigation =
	NavigationHelpers<ParamListBase, BottomTabNavigationEventMap> &
	TabActionHelpers<ParamListBase>;
const Tab = createBottomTabNavigator();

const screenOptions = (iconComponent: React.FC<SvgProps>, label: string) => ({
	tabBarIcon: ({ focused }: { focused: any }) =>
		React.createElement(iconComponent, {
			fill: focused ? colors.THEME_500 : colors.GREY_SCALE,
			width: 24,
			height: 24,
		}),
	tabBarLabel: label,
	tabBarLabelStyle: { fontFamily: REGULAR, fontSize: 10 },
});

const getCurrentStackScreens = (
    state: TabNavigationState<ParamListBase>
): { currentTabName: string; currentDiscountsScreen?: string; currentOffersScreen?: string } => {
    const currentTab = state.routes[state.index];
 
    const discountsStack = state.routes.find((r) => r.name === 'DiscountsStack');
    const offersStack = state.routes.find((r) => r.name === 'OffersStack');
 
    const currentDiscountsScreen = getCurrentRouteName(discountsStack?.state as NavigationState);
    const currentOffersScreen = getCurrentRouteName(offersStack?.state as NavigationState);
 
    return {
        currentTabName: currentTab.name,
        currentDiscountsScreen,
        currentOffersScreen,
    };
};
 
const shouldResetOffersStack = (
    currentTabName: string,
    currentDiscountsScreen?: string,
    currentOffersScreen?: string
): boolean => {
    return (
        currentTabName === 'DiscountsStack' &&
        currentDiscountsScreen === 'DiscountCode' &&
        currentOffersScreen === 'DiscountCode'
    );
};
 
const handleOffersTabPressWithConditionalReset =
    (navigation: Navigation) => (e: { preventDefault: () => void }) => {
        const navState = navigation.getState() as TabNavigationState<ParamListBase>;
        const { currentTabName, currentDiscountsScreen, currentOffersScreen } =
            getCurrentStackScreens(navState);
 
        if (shouldResetOffersStack(currentTabName, currentDiscountsScreen, currentOffersScreen)) {
            e.preventDefault();
 
            navigation.dispatch(
                CommonActions.navigate({
                    name: 'OffersStack',
                    params: {
                        screen: 'Offers',
                        params: {
                            resetOffers: true,
                        },
                    },
                })
            );
        }
    };

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
			listeners: ({ navigation }: any) => ({
				tabPress: handleOffersTabPressWithConditionalReset(navigation),
			}),
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
			name: "BenefitsStack",
			component: BenefitsStack,
			options: screenOptions(BenefitIcon, t("navigation.benefits")),

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
