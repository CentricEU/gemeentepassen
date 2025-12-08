// GlobalHeader.test.tsx

import React from "react";
import { headerOptions } from "./GlobalHeader";

// Mock dependencies
jest.mock("../../assets/icons/coins.svg", () => "CoinsIcon");
jest.mock("../../assets/icons/chevron-large-left_r.svg", () => "ArrowLeftRegularIcon");

describe("headerOptions", () => {
    it("has correct properties", () => {
        expect(headerOptions).toHaveProperty("headerTitleAlign", "center");
        expect(headerOptions).toHaveProperty("headerBackTitleVisible", false);
    });
});
