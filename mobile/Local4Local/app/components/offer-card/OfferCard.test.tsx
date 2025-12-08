import OfferCard from "./OfferCard";
import { fireEvent, render } from "@testing-library/react-native";
import { CitizenOfferType } from "../../utils/enums/citizenOfferType";
import { Text, View } from "react-native";
import { WorkingHour } from "../../utils/models/WorkingHour";
import { OfferMobileDetailDto } from "../../utils/types/offerMobileDetailDto";

jest.mock(
	"../../assets/icons/chevron-large-right_r.svg",
	() => "ArrowRightRegularIcon"
);

jest.mock("../offer-store-details/OfferStoreDetails", () => {
	return jest.fn(({ name, distance, isForMap }: any) => (
		<View>
			<Text>{name}</Text>
			<Text>{distance}</Text>
			<Text>{isForMap ? "Yes" : "No"}</Text>
		</View>
	));
});

const testOffer: OfferMobileDetailDto = {
	id: "offerId",
	title: "Test Offer",
	description: "Test Description",
	benefit: [],
	amount: 100,
	citizenOfferType: CitizenOfferType.citizenWithPass,
	offerType: {
		offerTypeId: 0,
		offerTypeLabel: "offerLabel",
	},
	startDate: new Date(),
	expirationDate: new Date(),
	coordinatesString: {
		longitude: 45,
		latitude: 45,
	},
	companyName: "Test Company",
	distance: 10,
	discountCode: "1234A",
	companyAddress: "Test Address",
	companyLogo: "Test Logo",
	workingHours: [
		new WorkingHour("id1", 0, "08:00:00", "16:00:00", true),
		new WorkingHour("id2", 1, "08:00:00", "16:00:00", true),
	],
	isActive: true,
};

describe("OfferCard component", () => {
	it("should render properly", () => {
		const { getByText } = render(<OfferCard offer={testOffer} />);

		expect(getByText("Test Offer")).toBeTruthy();
		expect(getByText("Test Description")).toBeTruthy();
		expect(getByText("Test Company")).toBeTruthy();
	});

	it("should disable ScrollView scrolling if the chips fit on the screen", () => {
		const { getByTestId } = render(<OfferCard offer={testOffer} />);

		const chipsScrollView = getByTestId("chips-scrollview");
		fireEvent(chipsScrollView, "onContentSizeChange", 8);

		expect(chipsScrollView.props["scrollEnabled"]).toBeFalsy();
	});

	it("should enable ScrollView scrolling if the chips do not fit on the screen", () => {
		const { getByTestId } = render(<OfferCard offer={testOffer} />);

		const chipsScrollView = getByTestId("chips-scrollview");
		fireEvent(chipsScrollView, "onContentSizeChange", 1024);

		expect(chipsScrollView.props["scrollEnabled"]).toBeTruthy();
	});

	it("should navigate to the offer if the card is pressed and isOnMap is false", () => {
		const navigation: any = { navigate: jest.fn() };

		const { getByTestId } = render(
			<OfferCard
				navigation={navigation}
				offer={testOffer}
				isOnMap={false}
			/>
		);

		const offerCard = getByTestId("offer-card-wrapper");
		fireEvent(offerCard, "onPress");

		expect(navigation.navigate).toHaveBeenCalled();
	});

	it("should not do anything if the card is pressed and isOnMap is true", () => {
		const navigation: any = { navigate: jest.fn() };

		const { getByTestId } = render(
			<OfferCard
				navigation={navigation}
				offer={testOffer}
				isOnMap={true}
			/>
		);

		const offerCard = getByTestId("offer-card-wrapper");
		fireEvent(offerCard, "onPress");

		expect(navigation.navigate).toHaveBeenCalledTimes(0);
	});

	it("should not render the View Details button if the card is not on the map", () => {
		const { queryByText } = render(
			<OfferCard offer={testOffer} isOnMap={false} />
		);

		const viewDetailsButton = queryByText("generic.buttons.viewDetails");

		expect(viewDetailsButton).toBeFalsy();
	});

	it("should navigate to the offer if the View Details button is pressed", () => {
		const navigation: any = { navigate: jest.fn() };

		const { getByText } = render(
			<OfferCard
				navigation={navigation}
				offer={testOffer}
				isOnMap={true}
			/>
		);

		const viewDetailsButton = getByText("generic.buttons.viewDetails");
		fireEvent.press(viewDetailsButton);

		expect(navigation.navigate).toHaveBeenCalled();
	});

	it("should render the grant chips if the offer has grants", () => {
		const offerWithGrants = {
			...testOffer,
			grants: [
				{
					id: 1,
					title: "Test Grant",
				},
			],
		};

		const { getByText } = render(
			<OfferCard offer={offerWithGrants} isOnMap={true} />
		);

		const grantChip = getByText("Test Grant");

		expect(grantChip).toBeTruthy();
	});
});
