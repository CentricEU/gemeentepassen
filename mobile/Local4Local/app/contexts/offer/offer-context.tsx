import { createContext } from "react";
import { OfferMobileDetailDto } from "../../utils/types/offerMobileDetailDto";
import { OfferMobileMapLightDto } from "../../utils/types/offerMobileMapLightDto";

export type OfferStateType = {
  offer?: OfferMobileDetailDto | null;
  offerGroup?: OfferMobileMapLightDto[];
  isDisplayed: boolean;
};

type OfferContextType = {
  offerState: OfferStateType;
  setOfferState: (state: OfferStateType) => void;
};

const OfferContext = createContext<OfferContextType>({
  offerState: { offer: null, isDisplayed: false, offerGroup: [] },
  setOfferState: (state: OfferStateType) => { },
});

export default OfferContext;
