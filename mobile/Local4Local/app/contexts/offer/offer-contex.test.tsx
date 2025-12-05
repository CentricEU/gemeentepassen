import React from "react";
import { render } from "@testing-library/react-native";
import OfferContext, { OfferStateType } from "./offer-context";
import { CitizenOfferType } from "../../utils/enums/citizenOfferType";
import { OfferMobileDetailDto } from "../../utils/types/offerMobileDetailDto";
import { WorkingHour } from "../../utils/models/WorkingHour";

describe("OfferContext", () => {
	const mockOffer: OfferMobileDetailDto = {
		id: "1",
		title: "Mock Offer",
		description: "Mock description",
		amount: 100,
		citizenOfferType: CitizenOfferType.citizenWithPass,
		offerType: { offerTypeId: 1, offerTypeLabel: "label" },
		startDate: new Date(),
		expirationDate: new Date(),
		coordinatesString: { latitude: 0, longitude: 0 },
		companyName: "Mock Company",
		distance: 10,
		grants: [],
		discountCode: "CODE1",
		companyAddress: "Mock Address",
		companyLogo: "mock-logo.png",
		workingHours: [
			new WorkingHour("id1", 0, "08:00:00", "16:00:00", true),
			new WorkingHour("id2", 1, "08:00:00", "16:00:00", true),
		],
	};

	it("should provide the correct initial values", () => {
		let offerStateValue: OfferStateType | undefined;
		let setOfferStateValue: ((state: OfferStateType) => void) | undefined;

		const ConsumerComponent = () => {
			const context = React.useContext(OfferContext);
			offerStateValue = context.offerState;
			setOfferStateValue = context.setOfferState;
			return null;
		};

		render(
			<OfferContext.Provider
				value={{
					offerState: { offer: null, isDisplayed: false },
					setOfferState: jest.fn(),
				}}
			>
				<ConsumerComponent />
			</OfferContext.Provider>
		);

		expect(offerStateValue).toEqual({ offer: null, isDisplayed: false });
		expect(setOfferStateValue).toBeDefined();
	});

	it("should provide updated values to consumers when setOfferState is called", () => {
		let offerStateValue: OfferStateType | undefined;

		const ConsumerComponent = () => {
			const context = React.useContext(OfferContext);
			offerStateValue = context.offerState;
			return null;
		};

		render(
			<OfferContext.Provider
				value={{
					offerState: { offer: mockOffer, isDisplayed: true },
					setOfferState: jest.fn(),
				}}
			>
				<ConsumerComponent />
			</OfferContext.Provider>
		);

		expect(offerStateValue).toEqual({
			offer: mockOffer,
			isDisplayed: true,
		});
	});
});
