import React, { useState } from "react";
import OfferContext, { OfferStateType } from "./offer-context";

const OfferProvider = ({ children }: any) => {
  const state: OfferStateType = {
    offer: null,
    isDisplayed: false,
  }

  const [offerState, setOfferState] = useState(state);
  
  return (
    <OfferContext.Provider value={{ offerState, setOfferState }}>
      {children}
    </OfferContext.Provider>
  );
};

export default OfferProvider;
