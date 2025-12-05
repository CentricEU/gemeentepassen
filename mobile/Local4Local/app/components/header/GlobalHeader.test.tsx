// GlobalHeader.test.tsx

import React from "react";
import { render } from "@testing-library/react-native";
import { HeaderRight, headerOptions } from "./GlobalHeader";

// Mock dependencies
jest.mock("../../assets/icons/coins.svg", () => "CoinsIcon");
jest.mock("../../assets/icons/chevron-large-left_r.svg", () => "ArrowLeftRegularIcon");

describe("HeaderRight", () => {
    it("renders correctly", () => {
        const { getByText } = render(<HeaderRight />);

        expect(getByText("40.000")).toBeDefined();
    });
});

describe("headerOptions", () => {
    it("has correct properties", () => {
        expect(headerOptions).toHaveProperty("headerRight", HeaderRight);
        expect(headerOptions).toHaveProperty("headerTitleAlign", "center");
        expect(headerOptions).toHaveProperty("headerBackTitleVisible", false);
        // Add more property checks as needed
    });
});
