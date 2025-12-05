import { render, screen, waitFor } from "@testing-library/react-native";
import { DiscountCode } from "./DiscountCode";
import DiscountCodeService from "../../services/DiscountCodeService";

jest.mock("../../services/DiscountCodeService");
jest.mock("react-i18next", () => ({
	useTranslation: jest.fn(() => ({
		t: (key: string) => key,
	})),
}));

jest.mock("../../utils/DateUtils", () => ({
	convertDateFormat: jest.fn(),
}));

describe("DiscountCode Component", () => {
	const mockDiscountCode = {
		companyLogo: "https://example.com/logo.png",
		companyName: "Example Company",
		offerType: {
			offerTypeId: 1,
			offerTypeLabel: "offerTypeLabel",
		},
		expirationDate: "2024-12-31",
		code: "DISCOUNT2024",
	};

	const mockRoute = { params: { offerId: "12345" } };

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("renders nothing if no discount code data is available", async () => {
		(DiscountCodeService.getDiscountCode as jest.Mock).mockResolvedValue(
			null
		);

		render(<DiscountCode route={mockRoute} navigation={{}} />);

		await waitFor(() =>
			expect(DiscountCodeService.getDiscountCode).toHaveBeenCalledWith(
				"12345"
			)
		);

		expect(screen.queryByText("Example Company")).toBeNull();
		expect(screen.queryByTestId("content-view")).toBeNull();
	});

	it("handles errors gracefully", async () => {
		(DiscountCodeService.getDiscountCode as jest.Mock).mockRejectedValue(
			new Error("API Error")
		);

		render(<DiscountCode route={mockRoute} navigation={{}} />);

		await waitFor(() =>
			expect(DiscountCodeService.getDiscountCode).toHaveBeenCalledWith(
				"12345"
			)
		);

		expect(screen.queryByText("Example Company")).toBeNull();
	});
});
