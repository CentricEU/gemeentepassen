import { act, fireEvent, render, waitFor } from "@testing-library/react-native";
import OfferService from "../../services/OfferService";
import { LocationContext } from "../../contexts/location/location-provider";
import { OfferTypeEnum } from "../../utils/enums/offerTypeEnum";
import { FrequencyOfUseEnum } from "../../utils/enums/frequencyOfUseEnum";
import OfferDetails from "./OfferDetails";
import { Text, TouchableOpacity, View } from "react-native";
import { UseOfferDto } from "../../utils/models/UseOfferDto";
import { RefreshProvider } from "../../contexts/pull-to-refresh/refresh-provider";

jest.useRealTimers();

jest.mock("../../services/OfferService", () => ({
	getFullOffer: jest.fn(),
	useOffer: jest.fn(),
}));

jest.mock(
	"react-native-vector-icons/MaterialCommunityIcons",
	() => "MockedMaterialCommunityIcons"
);

const locationMock = {
	location: {
		latitude: 52.3676,
		longitude: 4.9041,
	},
	setLocation: jest.fn(),
	handleClearWatch: jest.fn(),
};

const offerMock = {
	id: "offerId",
	description: "Sample offer description",
	offerType: { offerTypeId: OfferTypeEnum.freeEntry },
	amount: 50,
	startDate: "2023-01-01",
	expirationDate: "2023-12-31",
	companyName: "Sample Company",
	companyLogo: "logo.png",
	companyAddress: "Sample Address",
	companyCategory: "Sample Category",
	workingHours: [{ isChecked: true, day: "Monday", time: "9:00-17:00" }],
	restrictions: {
		frequencyOfUse: FrequencyOfUseEnum.DAILY,
		timeFrom: "09:00",
		timeTo: "17:00",
		ageRestriction: 18,
		minPrice: 10,
		maxPrice: 100,
	},
	lastOfferTransaction: { usageTime: "2023-01-01T10:00:00Z" },
	grants: [{ id: 1, title: "Sample Grant" }],
	isActive: true
};

jest.mock(
	"../../assets/icons/exclamation-triangle_b.svg",
	() => "ExclamationTriangleIcon"
);

jest.mock("../../components/supplier-info/SupplierInfo", () => {
	return jest.fn(({ name, logo, address }: any) => (
		<View>
			<Text>{name}</Text>
			<Text>{logo}</Text>
			<Text>{address}</Text>
		</View>
	));
});

jest.mock("../../components/error-toaster/CustomToaster", () => {
	return jest.fn(({ message, onClose }: any) => (
		<TouchableOpacity onPress={onClose}>
			<View>
				<Text>{message}</Text>
			</View>
		</TouchableOpacity>
	));
});

jest.mock("../../components/generic-button/GenericButton", () => {
	return jest.fn(({ text, onPressHandler }: any) => (
		<TouchableOpacity onPress={onPressHandler}>
			<Text>{text}</Text>
		</TouchableOpacity>
	));
});

describe("OfferDetails", () => {
	beforeEach(() => {
		(OfferService.getFullOffer as jest.Mock).mockResolvedValue(offerMock);
		(OfferService.useOffer as jest.Mock).mockResolvedValue({});
	});

	const renderComponent = () =>
		render(
			<RefreshProvider>
			<LocationContext.Provider value={locationMock}>
				<OfferDetails
					route={{ params: { offerId: 1 } }}
					navigation={{}}
				/>
			</LocationContext.Provider>
			</RefreshProvider>
		);

	it("should render offer details correctly", async () => {
		const { getByText } = renderComponent();

		await waitFor(() => {
			expect(getByText("Sample Company")).toBeTruthy();
			expect(getByText("Sample offer description")).toBeTruthy();
			expect(getByText("offerDetailsPage.validity")).toBeTruthy();
		});
	});

	it("should render the offer grants correctly", async () => {
		const { getByText } = renderComponent();

		await waitFor(() => {
			expect(getByText(offerMock.grants[0].title)).toBeTruthy();
		});
	});

	it("should log an error if offer fails to fetch in getFullOffer", async () => {
		const consoleMock = jest
			.spyOn(global.console, "error")
			.mockImplementation(jest.fn());

		(OfferService.getFullOffer as jest.Mock).mockImplementation(() => {
			throw new Error("failed to fetch");
		});

		try {
			renderComponent();
		} catch (error) {
			expect(consoleMock).toHaveBeenCalledWith("failed to fetch");
		}

		consoleMock.mockRestore();
	});

	describe("frequency of use messages", () => {
		const params = [
			[FrequencyOfUseEnum.DAILY, "offerRestriction.alreadyUsedToday"],
			[FrequencyOfUseEnum.MONTHLY, "offerRestriction.alreadyUsedMonth"],
			[FrequencyOfUseEnum.WEEKLY, "offerRestriction.alreadyUsedWeek"],
			[FrequencyOfUseEnum.YEARLY, "offerRestriction.alreadyUsedYear"],
			[FrequencyOfUseEnum.SINGLE_USE, "offerRestriction.alreadyUsed"],
		];

		it.each(params)(
			"%s should result in the %s error",
			async (restriction, error) => {
				const offer = {
					...offerMock,
					restrictions: {
						frequencyOfUse: restriction,
					},
				};

				(OfferService.getFullOffer as jest.Mock).mockResolvedValue(
					offer
				);
				offerMock.lastOfferTransaction.usageTime =
					new Date().toISOString();

				const { getByText, queryByText } = renderComponent();

				await waitFor(() => {
					expect(getByText(error)).toBeTruthy();

					const getOfferButton = queryByText("Get Offer");
					expect(getOfferButton).toBeNull();
				});
			}
		);
	});

	describe("useOffer", () => {
		it("should claim the selected offer", async () => {
			(OfferService.getFullOffer as jest.Mock).mockResolvedValue({
				...offerMock,
				restrictions: null,
			});

			const { getByText } = renderComponent();

			await waitFor(() => {
				expect(getByText("offerDetailsPage.getOffer")).toBeTruthy();
			});

			
			await act(async () => {
				fireEvent.press(getByText("offerDetailsPage.getOffer"));
			});

			expect(OfferService.useOffer).toHaveBeenCalledWith(
				new UseOfferDto(offerMock.id, expect.anything())
			);
		});
	});

	describe("offer amount for every type of offer", () => {
		const params = [
			[OfferTypeEnum.percentage, "50%"],
			[OfferTypeEnum.bogo, "offerDetailsPage.bogo"],
			[OfferTypeEnum.credit, "€50"],
		];

		it.each(params)(
			"offers of type %s should display the amount correctly",
			async (type, amount) => {
				const offer = {
					...offerMock,
					offerType: { offerTypeId: type },
				};

				(OfferService.getFullOffer as jest.Mock).mockResolvedValue(
					offer
				);

				const { getByText } = renderComponent();

				await waitFor(() => {
					expect(getByText(amount as string)).toBeTruthy();
				});
			}
		);
	});

	it("should display time slots warning if outside allowed hours", async () => {
		offerMock.restrictions.timeFrom = "09:00";
		offerMock.restrictions.timeTo = "10:00";
		offerMock.lastOfferTransaction.usageTime = null as any;

		const { getByText, rerender } = renderComponent();

		await waitFor(() => {
			expect(getByText("offerDetailsPage.hourValidity")).toBeTruthy();
		});

		offerMock.restrictions.timeFrom = "11:00";
		offerMock.restrictions.timeTo = "12:00";

		rerender(
			<RefreshProvider>
			<LocationContext.Provider value={locationMock}>
				<OfferDetails
					route={{ params: { offerId: 1 } }}
					navigation={{}}
				/>
			</LocationContext.Provider>
			</RefreshProvider>
		);

		await waitFor(() => {
			expect(getByText("offerDetailsPage.hourValidity")).toBeTruthy();
		});
	});

	it("handles no location context gracefully", async () => {
		locationMock.location = null as any;
		const { queryByText } = renderComponent();

		await waitFor(() => {
			expect(queryByText("Sample Company")).toBeNull();
			expect(queryByText("Sample offer description")).toBeNull();
		});
	});
});
