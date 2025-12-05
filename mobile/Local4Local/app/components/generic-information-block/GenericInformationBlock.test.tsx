import React from "react";
import { render } from "@testing-library/react-native";
import {Text} from "react-native-paper";
import GenericInformationBlock from "./GenericInformationBlock";

describe("GenericInformationBlock", () => {
    it("renders correctly", () => {
        const title = "Sample Title";
        const headerRight = <Text>Header Right Content</Text>;
        const children = [
          { label: "Label 1", textValue: "Value 1", componentValue: null },
          {
            label: "Label 2",
            textValue: "Value 2",
            componentValue: null,
          },
        ];
    
        const { getByText } = render(
          <GenericInformationBlock
            title={title}
            headerRight={headerRight}
            children={children}
          />
        );
    
        expect(getByText(title)).toBeDefined();
        expect(getByText("Header Right Content")).toBeDefined();
        expect(getByText("Label 1: Value 1")).toBeDefined();
        expect(getByText("Label 2: Value 2")).toBeDefined();
      });
});
