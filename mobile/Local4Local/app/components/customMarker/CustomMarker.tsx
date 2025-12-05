import { Marker } from "react-native-maps";
import { MARKER_IMAGES } from "../../utils/constants/mapConstants";
import { useContext } from "react";
import OfferContext from "../../contexts/offer/offer-context";
import { OfferMobileMapLightDto } from "../../utils/types/offerMobileMapLightDto";
import OfferService from "../../services/OfferService";
import { LocationContext } from "../../contexts/location/location-provider";
import { LatLon } from "../../utils/types/latLon";
import { Text } from "react-native-paper";
import styles from "./CustomMarkerStyle";
import { View } from "react-native";

interface CustomMarkerProps {
	offer?: OfferMobileMapLightDto;
	offerGroup?: OfferMobileMapLightDto[];
}

export default function CustomMarker(props: CustomMarkerProps) {

	const { location } = useContext(LocationContext);
	const { setOfferState } = useContext(OfferContext);

	const getFullOffer = async () => {
		try {
			if (!location) {
				return;
			}

			const offer = await OfferService.getFullOffer((props.offer as OfferMobileMapLightDto).id, location.latitude.toString(), location.longitude.toString());
			return offer;
		} catch (error) {
			console.error(error);
			return null;
		}
	};

	const handleMarkerPress = async () => {
		if (props.offer) {
			onMarkerPressForSingleOffer();
			return;
		}
		onMarkerPressForGroupOffers()
	};

	const onMarkerPressForSingleOffer = async () => {
		const offer = await getFullOffer();

		if (offer) {
			offer.coordinatesString = JSON.parse(offer.coordinatesString);

			const newState = { offer: offer, isDisplayed: true };
			setOfferState(newState);
		}
	};

	const onMarkerPressForGroupOffers = async () => {
		const newState = { offerGroup: props.offerGroup, isDisplayed: true };
		setOfferState(newState);
	};

	return (
		props.offer ?
			<Marker
				key={props.offer.id}
				testID={"single-offer"}
				coordinate={props.offer.coordinatesString as LatLon}
				title={props.offer.title}
				description={props.offer.description}
				image={MARKER_IMAGES[props.offer.offerType.offerTypeId]}
				onPress={handleMarkerPress}
				style={{ opacity: props.offer.isActive ? 1 : 0.5 }}
			/> :

			<Marker coordinate={(props.offerGroup as OfferMobileMapLightDto[])[0].coordinatesString as LatLon}
				onPress={handleMarkerPress}
				testID={"multiple-offers"}>
				<View style={styles.markerContainer}>
					<Text style={styles.markerText}>{props.offerGroup?.length}</Text>
				</View>
			</Marker>
	);
}
