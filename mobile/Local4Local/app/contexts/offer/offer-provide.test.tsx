import React from "react";
import { render } from "@testing-library/react-native";
import OfferContext from "./offer-context";
import OfferProvider from "./offer-provider";
import { Text } from "react-native-paper";
import { View } from "react-native";

describe("OfferProvider", () => {
  it("renders its children", () => {
    const { getByTestId } = render(
      <OfferProvider>
        <View testID="child" />
      </OfferProvider>
    );

    const childElement = getByTestId("child");
    expect(childElement).toBeTruthy();
  });

  it("provides the correct context value", () => {
    const ConsumerComponent = () => {
      const { offerState, setOfferState } = React.useContext(OfferContext);

      return (
        <Text testID="context-value">{JSON.stringify(offerState.offer)}</Text>
      );
    };

    const { getByTestId } = render(
      <OfferProvider>
        <ConsumerComponent />
      </OfferProvider>
    );

    const contextValueElement = getByTestId("context-value");
    const expectedValue = JSON.stringify(null);
    expect(contextValueElement.props["children"]).toEqual(expectedValue);
  });
});
