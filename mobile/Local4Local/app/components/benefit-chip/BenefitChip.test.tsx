import React from "react";
import { render } from "@testing-library/react-native";
import BenefitChip from "./BenefitChip";

describe("BenefitChip", () => {
    it("renders correctly with label", () => {
        const label = "Test Label";

        const { getByText } = render(<BenefitChip label={label} />);

        expect(getByText(label)).toBeDefined();
    });
});