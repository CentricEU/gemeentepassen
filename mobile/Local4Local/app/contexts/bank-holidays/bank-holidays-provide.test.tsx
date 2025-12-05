import React, { useEffect } from "react";
import { render, waitFor } from "@testing-library/react-native";
import BankHolidaysProvider from "./bank-holidays-provider";
import { View } from "react-native";
import BankHolidaysContext from "./bank-holidays-context";
import { Text } from "react-native-paper";

describe("BankHolidaysProvider", () => {
  it("renders its children", () => {
    const { getByTestId } = render(
      <BankHolidaysProvider>
        <View testID="child" />
      </BankHolidaysProvider>
    );

    const childElement = getByTestId("child");
    expect(childElement).toBeTruthy();
  });

  it("provides the correct context value", async () => {
    const ConsumerComponent = () => {
      const { bankHolidaysForCurrentYear, setBankHolidaysForCurrentYear } = React.useContext(BankHolidaysContext);
      useEffect(() => {
        setBankHolidaysForCurrentYear([{
          id: 'string',
          countryCode: 'string',
          date: new Date(),
          year: 2024
        }]);
      }, [setBankHolidaysForCurrentYear]);

      return (
        <Text testID="context-value">
          {bankHolidaysForCurrentYear.length > 0 ? bankHolidaysForCurrentYear[0].countryCode : ""}
        </Text>
      );
    };

    const { getByTestId } = render(
      <BankHolidaysProvider>
        <ConsumerComponent />
      </BankHolidaysProvider>
    );

    await waitFor(() => {
      const contextValueElement = getByTestId("context-value");
      const expectedValue = 'string';
      expect(contextValueElement.props["children"]).toEqual(expectedValue);
    });
  });



});
