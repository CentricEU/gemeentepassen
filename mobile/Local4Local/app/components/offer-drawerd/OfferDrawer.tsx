import { Modal, TouchableWithoutFeedback, View } from "react-native";
import styles from "../../common-style/OfferDrawerStyle";
import { useContext } from "react";
import OfferContext from "../../contexts/offer/offer-context";
import OfferCard from "../offer-card/OfferCard";
import { OfferMobileListDto } from "../../utils/types/offerMobileListDto";

export default function OfferDrawer({ navigation }: any) {

  const { offerState, setOfferState } = useContext(OfferContext);

  const handleOverlayPress = () => {
    const newOfferState = { ...offerState, isDisplayed: false };
    setOfferState(newOfferState);
  };

  return (
    (
      !!offerState.offer ? (<Modal
        testID="modal"
        animationType="slide"
        transparent={true}
        visible={offerState.isDisplayed}
      >
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View testID="testOverlay" style={styles.overlay}>
            <TouchableWithoutFeedback>
              <OfferCard
                offer={offerState.offer as OfferMobileListDto}
                customStyle={styles.drawer}
                isOnMap={true}
                navigation={navigation}
              />
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>) :
        <></>
    )

  );
}
