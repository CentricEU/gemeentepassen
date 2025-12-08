import { useEffect, useState } from "react";
import { Keyboard } from "react-native";
import MapView, { PROVIDER_GOOGLE, Region } from "react-native-maps";
import CustomMarker from "../customMarker/CustomMarker";
import {
  LONGITUDE_DELTA,
  LATITUDE_DELTA,
  MAP_STYLE,
  MAX_ZOOM_LEVEL,
} from "../../utils/constants/mapConstants";
import styles from "./MapStyle";
import OfferService from "../../services/OfferService";
import { OffersMapDto } from "../../utils/types/offerMapDto";
import { OfferMobileMapLightDto } from "../../utils/types/offerMobileMapLightDto";
import { MINIMUM_SEARCH_KEYWORD_LENGTH } from "../../utils/constants/constants";

export default function Map({
  currentLocation,
  offerType,
  searchKeyword,
}: any) {
  const [mapRef, setMapRef] = useState<null | MapView>(null);
  const [individualOffers, setIndividualOffers] = useState<
    OfferMobileMapLightDto[]
  >([]);
  const [groupedOffers, setGroupedOffers] = useState<
    OfferMobileMapLightDto[][]
  >([]);

  const [region, setRegion] = useState<Region>({
    latitude: currentLocation.latitude,
    longitude: currentLocation.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  useEffect(() => {
    getMapOffersWithViewport(region);
  }, [region, offerType, searchKeyword]);

  const getMapOffersWithViewport = async (region: Region) => {
    try {
      const validKeyword =
        searchKeyword?.length >= MINIMUM_SEARCH_KEYWORD_LENGTH
          ? searchKeyword
          : null;

      const offersMap: OffersMapDto =
        await OfferService.getMapOffersWithViewport(
          region,
          offerType,
          validKeyword
        );

      const offersArray: OfferMobileMapLightDto[] = [];
      const groupedOffersArray: OfferMobileMapLightDto[][] = [];
      Object.entries(offersMap).map(([coordinates, offers]) => {
        if (offers.length <= 1) {
          offersArray.push(offers[0] as OfferMobileMapLightDto);
          return;
        }
        groupedOffersArray.push(offers);
      });
      setIndividualOffers(offersArray);
      setGroupedOffers(groupedOffersArray);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    setRegion(newRegion);
    Keyboard.dismiss();
  };

  return (
    <MapView
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={region}
      followsUserLocation={true}
      customMapStyle={MAP_STYLE}
      showsUserLocation={true}
      toolbarEnabled={false}
      showsCompass={false}
      showsMyLocationButton={false}
      ref={(ref) => {
        setMapRef(ref);
      }}
      onRegionChangeComplete={handleRegionChangeComplete}
      minZoomLevel={MAX_ZOOM_LEVEL}
      onPress={() => Keyboard.dismiss()}
    >
      {individualOffers.map((offer: OfferMobileMapLightDto) => (
        <CustomMarker key={offer.id} offer={offer} />
      ))}

      {groupedOffers.map((offerGroup: OfferMobileMapLightDto[]) => (
        <CustomMarker key={offerGroup[0].id} offerGroup={offerGroup} />
      ))}
    </MapView>
  );
}
