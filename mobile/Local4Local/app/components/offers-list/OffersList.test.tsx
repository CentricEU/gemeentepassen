import OffersList from "./OffersList";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import { Text, View } from "react-native";
import { CitizenOfferType } from "../../utils/enums/citizenOfferType";
import { RefreshProvider } from "../../contexts/pull-to-refresh/refresh-provider";
import { NavigationContainer } from "@react-navigation/native";

jest.mock(
	"../../assets/icons/hand-euro-coin_b.svg",
	() => "HandEuroCoinBoldIcon"
);
jest.mock("../../assets/icons/percent_b.svg", () => "PercentBoldIcon");
jest.mock("../../assets/icons/plus_eb.svg", () => "PlusBoldIcon");
jest.mock("../../assets/icons/euro-coin_b.svg", () => "EuroCoinIcon");

jest.mock("../offer-type-selector/OfferTypeSelector", () => {
	return jest.fn(({ customStyle, selectedType, setSelectedType }: any) => (
		<View>
			<Text testID="offer-type-button">{selectedType}</Text>
		</View>
	));
});

jest.mock("../offer-card/OfferCard", () => {
	return jest.fn(({ navigation, offer, customStyle, isOnMap }: any) => (
		<View>
			<Text>{offer.title}</Text>
		</View>
	));
});

const createMockedOffer = (name: any) => {
	return {
		id: `offerId_${name}`,
		title: `Test Offer ${name}`,
		description: `Test Description ${name}`,
		amount: 100,
		citizenOfferType: CitizenOfferType.citizenWithPass,
		offerType: {
			offerTypeId: 0,
			offerTypeLabel: "offerLabel",
		},
		startDate: new Date(),
		expirationDate: new Date(),
		coordinatesString: '{"longitude":45, "latitude":45}',
		companyName: `Test Company ${name}`,
		distance: 10,
		grants: [],
		companyAddress: `Test Address ${name}`,
		companyLogo: `Test Logo ${name}`,
	};
};

describe("OffersList component", () => {
	it("renders without crashing", () => {
		render(
			<NavigationContainer>
				<RefreshProvider>
					<OffersList
						currentLocation={{ longitude: 45, latitude: 45 }}
					/>
				</RefreshProvider>
			</NavigationContainer>
		);
	});

	it("renders the offer type buttons", () => {
		const { getByTestId } = render(
			<NavigationContainer>
				<RefreshProvider>
					<OffersList
						currentLocation={{ longitude: 45, latitude: 45 }}
					/>
				</RefreshProvider>
			</NavigationContainer>
		);

		const offerTypeButton = getByTestId("offer-type-button");

		expect(offerTypeButton).toBeTruthy();
	});

	it("fetches and displays the correct offers", async () => {
		const mockedData: any = [
			createMockedOffer("test1"),
			createMockedOffer("test2"),
		];

		global.fetch = jest.fn().mockResolvedValueOnce({
			json: jest.fn().mockResolvedValueOnce(mockedData),
		});

		const { getByText } = render(
			<NavigationContainer>
				<RefreshProvider>
					<OffersList
						currentLocation={{ longitude: 45, latitude: 45 }}
					/>
				</RefreshProvider>
			</NavigationContainer>
		);

		await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

		expect(getByText("Test Offer test1")).toBeTruthy();
		expect(getByText("Test Offer test2")).toBeTruthy();
	});

	it("should catch the thrown error if fetch fails", async () => {
		jest.spyOn(console, "error").mockImplementation();

		global.fetch = jest.fn().mockResolvedValueOnce({
			json: jest.fn().mockImplementation(() => {
				throw new Error();
			}),
		});

		render(
			<NavigationContainer>
				<RefreshProvider>
					<OffersList
						currentLocation={{ longitude: 45, latitude: 45 }}
					/>
				</RefreshProvider>
			</NavigationContainer>
		);

		await waitFor(() => expect(console.error).toHaveBeenCalledTimes(1));
	});

	it("should request more offers when onEndReach is called, offers are not loading, and data is not empty", async () => {
		const mockedData1: any = [createMockedOffer("test1")];
		const mockedData2: any = [createMockedOffer("test2")];

		global.fetch = jest
			.fn()
			.mockResolvedValueOnce({
				json: jest.fn().mockResolvedValueOnce(mockedData1),
			})
			.mockResolvedValueOnce({
				json: jest.fn().mockResolvedValueOnce(mockedData2),
			});

		const { getByTestId } = render(
			<NavigationContainer>
				<RefreshProvider>
					<OffersList
						currentLocation={{ longitude: 45, latitude: 45 }}
					/>
				</RefreshProvider>
			</NavigationContainer>
		);

		await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

		fireEvent(getByTestId("offers-flat-list"), "onEndReached");

		await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));
	});
});
