import { View } from "react-native";
import Map from "../../components/map/Map";
import { headerOptions } from "../../components/header/GlobalHeader";
import SearchBar from "../../components/search-bar/SearchBar";
import ViewModeButton from "../../components/view-mode-button/ViewModeButton";
import OfferTypeSelector from "../../components/offer-type-selector/OfferTypeSelector";
import { useContext, useState } from "react";
import styles from "./OffersStyle";
import OffersList from "../../components/offers-list/OffersList";
import OfferDetails from "../offer-details/OfferDetails";
import { createStackNavigator } from "@react-navigation/stack";
import { useTranslation } from "react-i18next";
import OfferDrawer from "../../components/offer-drawerd/OfferDrawer";
import { LocationContext } from "../../contexts/location/location-provider";
import OffersGroupDrawer from "../../components/offers-group-drawer/OffersGroupDrawer";
import { DiscountCode } from "../discount-code/DiscountCode";

export type OfferStackParamList = {
	Offers: undefined;
	OfferDetails: {
		offerTitle: string;
		offerId: string;
	};
	DiscountCode: {
		offerTitle: string;
		offerId: string;
	};
};

const Stack = createStackNavigator<OfferStackParamList>();

export function Offers({ navigation }: { navigation: any }) {
	const { location } = useContext(LocationContext);

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedType, setSelectedType] = useState(-1);
	const [isMapMode, setIsMapMode] = useState(true);

	const switchViewMode = () => {
		setIsMapMode(!isMapMode);
	};

	const displayMapView = () => {
		return (
			location && (
				<>
					<OfferTypeSelector
						customStyle={styles.mapOfferTypeSelector}
						selectedType={selectedType}
						setSelectedType={setSelectedType}
					/>
					<Map testID="map-view" currentLocation={location} />

					<OfferDrawer navigation={navigation} />
					<OffersGroupDrawer navigation={navigation} />
				</>
			)
		);
	};

	return (
		<View style={styles.container}>
			<SearchBar
				value={searchQuery}
				changeTextHandler={setSearchQuery}
				placeholder={"search.searchBarTextOffer"}
				hideFilterButton={false}
			/>
			{isMapMode
				? displayMapView()
				: location && (
						<OffersList
							testID="offers-list"
							currentLocation={location}
							selectedType={selectedType}
							setSelectedType={setSelectedType}
							navigation={navigation}
						/>
				  )}
			<ViewModeButton
				testID="view-mode-button"
				customStyle={styles.viewModeButton}
				mapMode={isMapMode}
				onPressHandler={switchViewMode}
			/>
		</View>
	);
}

export function OffersStack({}: { navigation: any }) {
	const { t } = useTranslation("common");

	return (
		<Stack.Navigator
			screenOptions={{
				headerShadowVisible: false,
				...headerOptions,
				headerStyle: {
					shadowColor: "transparent",
				},
			}}
		>
			<Stack.Screen
				name="Offers"
				component={Offers}
				options={{
					title: t("navigation.offers"),
				}}
			/>
			<Stack.Screen
				name={"OfferDetails"}
				component={OfferDetails}
				options={({ route }) => ({ title: route?.params?.offerTitle })}
			/>

			<Stack.Screen
				name={"DiscountCode"}
				component={DiscountCode}
				options={({ route }) => ({ title: route?.params?.offerTitle })}
			/>
		</Stack.Navigator>
	);
}
