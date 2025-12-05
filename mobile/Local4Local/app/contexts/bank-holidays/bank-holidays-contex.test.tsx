
import React, { useEffect } from "react";
import { render, waitFor } from "@testing-library/react-native";
import BankHolidaysContext from "./bank-holidays-context";
import { Text } from "react-native-paper";
import { View } from "react-native";

describe("BankHolidaysProvider", () => {
  it("renders its children", () => {
    const { getByTestId } = render(
      <BankHolidaysContext.Provider value={{bankHolidaysForCurrentYear: [], setBankHolidaysForCurrentYear: jest.fn() }}>
        <View testID="child" />
      </BankHolidaysContext.Provider >
    );

    const childElement = getByTestId("child");
    expect(childElement).toBeTruthy();
  });

  it("provides the correct context value", async () => {
    const ConsumerComponent = () => {
      const { bankHolidaysForCurrentYear } = React.useContext(BankHolidaysContext);

      return (
        <Text testID="context-value">
          {bankHolidaysForCurrentYear.length > 0 ? bankHolidaysForCurrentYear[0].countryCode : ""}
        </Text>
      );
    };

    const { getByTestId } = render(
      <BankHolidaysContext.Provider value={{bankHolidaysForCurrentYear: [{
        id: 'string',
        countryCode: 'string',
        date: new Date(),
        year: 2024
      }], setBankHolidaysForCurrentYear: jest.fn() }}>
        <ConsumerComponent />
      </BankHolidaysContext.Provider>
    );

    await waitFor(() => {
      const contextValueElement = getByTestId("context-value");
      const expectedValue = 'string';
      expect(contextValueElement.props['children']).toEqual(expectedValue);
    });
  });
});
