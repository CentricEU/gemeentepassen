import React from "react";
import { GestureResponderEvent, Modal, TouchableWithoutFeedback, View } from "react-native";
import styles from "./OffersGroupDrawerStyle";
import commonDrawer from "../../common-style/OfferDrawerStyle";
import { useContext, useState } from "react";
import OfferContext from "../../contexts/offer/offer-context";
import { List, Text } from "react-native-paper";
import { useTranslation } from "react-i18next";
import OfferChip from "../offer-chip/OfferChip";
import common from "../../common-style/CommonStyle";
import { OfferMobileMapLightDto } from "../../utils/types/offerMobileMapLightDto";
import { FlatList } from "react-native-gesture-handler";
import { LocationContext } from "../../contexts/location/location-provider";
import OfferService from "../../services/OfferService";
import { OfferMobileDetailDto } from "../../utils/types/offerMobileDetailDto";
import OfferCard from "../offer-card/OfferCard";
import LoadingIndicator from "../loader/LoadingIndicator";

export default function OffersGroupDrawer({ navigation }: any) {
  const { t } = useTranslation("common");
  const { location } = useContext(LocationContext);
  const { offerState, setOfferState } = useContext(OfferContext);
  const [expandedOfferId, setExpandedOfferId] = useState<string>('');
  const [offerDetails, setOfferDetails] = useState<OfferMobileDetailDto | null>(null);

  const handleOverlayPress = () => {
    const newOfferState = { ...offerState, isDisplayed: false };
    setOfferState(newOfferState);
  };

  const getFullOffer = async (lightOffer: OfferMobileMapLightDto) => {
    try {
      if (!location) {
        return;
      }
      if (!lightOffer.loadedOffer) {
        const loadedOffer = await OfferService.getFullOffer(lightOffer.id, location.latitude.toString(), location.longitude.toString());
        lightOffer.loadedOffer = loadedOffer;
      }
      setOfferDetails(lightOffer.loadedOffer as OfferMobileDetailDto);
    } catch (error) {
      console.error(error);
      return;
    }
  };

  const accordionComponents = (item: OfferMobileMapLightDto) => {
    {
      return (
        <List.Accordion
          theme={{ colors: { background: 'transparent' } }}
          style={[common.cardAppearance, styles.accordionStyle]}
          expanded={item.id === expandedOfferId}
          titleStyle={styles.accordionTitle}
          key={item.id}
          title={item.title}
          right={props => <OfferChip  {...props} typeId={item.offerType.offerTypeId} />}
          left={props => <List.Icon {...props} icon={item.id === expandedOfferId ? 'chevron-down' : 'chevron-right'} />}
          onPress={(e: GestureResponderEvent) => {
            setOfferDetails(null);
            if (expandedOfferId === item.id) {
              setExpandedOfferId('');
              return;
            }

            getFullOffer(item);
            setExpandedOfferId(item.id)
            e.stopPropagation();
          }}>

          {offerDetails &&
            <OfferCard
              offer={offerDetails as OfferMobileDetailDto}
              customStyle={styles.detailsCard}
              isOnMap={true}
              navigation={navigation}
            />}
        </List.Accordion>
      );
    }
  }

  return (
    offerState.offerGroup ? (<Modal
      testID="modal"
      animationType="slide"
      transparent={true}
      visible={offerState.isDisplayed}
    >
      <LoadingIndicator />
      <TouchableWithoutFeedback onPress={handleOverlayPress}>
        <View testID="testOverlay" style={commonDrawer.overlay}>

          {(offerState.offerGroup.length > 0) &&
            <TouchableWithoutFeedback>
              <View style={[commonDrawer.drawer, styles.drawerBackground]}>
                <View style={styles.drawerHeader}>
                  <Text style={styles.bolderStyle}>
                    {t("offersPage.offerGroup", {
                      number: offerState.offerGroup.length
                    })}
                  </Text>
                  {/* <Button textColor={colors.THEME_500} compact={true} mode='text'>{t('generic.buttons.viewList')}</Button> */}
                </View>
                <FlatList
                  style={styles.groupContainer}
                  data={offerState.offerGroup}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => accordionComponents(item)}
                />
              </View>
            </TouchableWithoutFeedback>
          }
        </View>
      </TouchableWithoutFeedback >
    </Modal >
    ) :
      <></>

  );
}
