import React from "react";
import { render } from "@testing-library/react-native";
import GrantChip from "./GrantChip";

describe("GrantChip", () => {
    it("renders correctly with label", () => {
        const label = "Test Label";

        const { getByText } = render(<GrantChip label={label} />);

        expect(getByText(label)).toBeDefined();
    });
});