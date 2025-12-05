import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import OfferContext from "../../contexts/offer/offer-context";
import OffersGroupDrawer from "./OffersGroupDrawer";
import { OfferMobileMapLightDto } from "../../utils/types/offerMobileMapLightDto";
import { CitizenOfferType } from "../../utils/enums/citizenOfferType";
import { RefreshProvider } from "../../contexts/pull-to-refresh/refresh-provider";

jest.mock("../offer-card/OfferCard", () => (props: any) => (
	<div {...props}>OfferCard Mock</div>
));

describe("OffersGroupDrawer", () => {
	const mockSetOfferState = jest.fn();
	const mockOfferState = {
		isDisplayed: true,
		offerGroup: [
			{
				id: "1",
				title: "Mock Offer",
				description: "Mock description",
				citizenOfferType: CitizenOfferType.citizenWithPass,
				offerType: { offerTypeId: 1, offerTypeLabel: "label" },
				coordinatesString: { latitude: 0, longitude: 0 },
				isActive: true,
			} as OfferMobileMapLightDto,
		],
	};

	const renderComponent = (offerState = mockOfferState) => {
		return render(
			<RefreshProvider>
				<OfferContext.Provider
					value={{ offerState, setOfferState: mockSetOfferState }}
				>
					<OffersGroupDrawer navigation={{}} />
				</OfferContext.Provider>
			</RefreshProvider>
		);
	};

	it("should render the modal when offerState.isDisplayed is true", () => {
		const { getByTestId } = renderComponent();

		expect(getByTestId("modal")).toBeTruthy();
		expect(getByTestId("testOverlay")).toBeTruthy();
	});

	it("should call setOfferState with new state when overlay is pressed", () => {
		const { getByTestId } = renderComponent();
		const overlay = getByTestId("testOverlay");

		fireEvent.press(overlay);

		expect(mockSetOfferState).toHaveBeenCalledWith({
			...mockOfferState,
			isDisplayed: false,
		});
	});
});
