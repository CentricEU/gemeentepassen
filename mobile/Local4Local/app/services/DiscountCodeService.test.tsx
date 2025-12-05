import DiscountCodeService from "../services/DiscountCodeService";
import { trackPromise } from "react-promise-tracker";
import { apiPath } from "../utils/constants/api";
import { AUTH_HEADER } from "../utils/constants/headers";

jest.mock("react-promise-tracker", () => ({
	trackPromise: jest.fn((promise) => promise),
}));

jest.mock("../utils/constants/headers", () => ({
	AUTH_HEADER: jest.fn(),
}));

describe("DiscountCodeService", () => {
	const mockOfferId = "12345";
	const mockApiPath = `${apiPath}/discount-codes/${encodeURIComponent(
		mockOfferId
	)}`;

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should fetch discount code successfully", async () => {
		const mockHeaders = { Authorization: "Bearer token" };
		const mockResponse = { discountCode: "DISCOUNT2024" };

		(AUTH_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
		global.fetch = jest.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			})
		) as jest.Mock;

		const result = await DiscountCodeService.getDiscountCode(mockOfferId);

		expect(AUTH_HEADER).toHaveBeenCalled();
		expect(fetch).toHaveBeenCalledWith(mockApiPath, {
			method: "GET",
			headers: mockHeaders,
		});
		expect(trackPromise).toHaveBeenCalled();
		expect(result).toEqual(mockResponse);
	});

	it("should throw an error if the response is not ok", async () => {
		const mockHeaders = { Authorization: "Bearer token" };

		(AUTH_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
		global.fetch = jest.fn(() =>
			Promise.resolve({
				ok: false,
				status: 404,
			})
		) as jest.Mock;

		await expect(
			DiscountCodeService.getDiscountCode(mockOfferId)
		).rejects.toThrow("404");

		expect(AUTH_HEADER).toHaveBeenCalled();
		expect(fetch).toHaveBeenCalledWith(mockApiPath, {
			method: "GET",
			headers: mockHeaders,
		});
		expect(trackPromise).toHaveBeenCalled();
	});

	it("should throw an error if there is a network issue", async () => {
		const mockHeaders = { Authorization: "Bearer token" };
		const mockError = new Error("Network Error");

		(AUTH_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
		global.fetch = jest.fn(() => Promise.reject(mockError)) as jest.Mock;

		await expect(
			DiscountCodeService.getDiscountCode(mockOfferId)
		).rejects.toThrow(mockError);

		expect(AUTH_HEADER).toHaveBeenCalled();
		expect(fetch).toHaveBeenCalledWith(mockApiPath, {
			method: "GET",
			headers: mockHeaders,
		});
		expect(trackPromise).toHaveBeenCalled();
	});

	it("should fetch all discount codes successfully", async () => {
		const mockHeaders = { Authorization: "Bearer token" };
		const mockResponse = [
			{ discountCode: "DISCOUNT2024" },
			{ discountCode: "DISCOUNT2025" },
		];

		(AUTH_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
		global.fetch = jest.fn(() =>
			Promise.resolve({
				ok: true,
				json: () => Promise.resolve(mockResponse),
			})
		) as jest.Mock;

		const result = await DiscountCodeService.getAllDiscountCodes();

		expect(AUTH_HEADER).toHaveBeenCalled();
		expect(fetch).toHaveBeenCalledWith(`${apiPath}/discount-codes`, {
			method: "GET",
			headers: mockHeaders,
		});
		expect(trackPromise).toHaveBeenCalled();
		expect(result).toEqual(mockResponse);
	});

	it("should throw an error if the response is not ok when fetching all discount codes", async () => {
		const mockHeaders = { Authorization: "Bearer token" };

		(AUTH_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
		global.fetch = jest.fn(() =>
			Promise.resolve({
				ok: false,
				statusText: "Not Found",
			})
		) as jest.Mock;

		await expect(DiscountCodeService.getAllDiscountCodes()).rejects.toThrow(
			"Not Found"
		);

		expect(AUTH_HEADER).toHaveBeenCalled();
		expect(fetch).toHaveBeenCalledWith(`${apiPath}/discount-codes`, {
			method: "GET",
			headers: mockHeaders,
		});
		expect(trackPromise).toHaveBeenCalled();
	});

	it("should throw an error if there is a network issue when fetching all discount codes", async () => {
		const mockHeaders = { Authorization: "Bearer token" };
		const mockError = new Error("Network Error");

		(AUTH_HEADER as jest.Mock).mockResolvedValue(mockHeaders);
		global.fetch = jest.fn(() => Promise.reject(mockError)) as jest.Mock;

		await expect(DiscountCodeService.getAllDiscountCodes()).rejects.toThrow(
			mockError
		);

		expect(AUTH_HEADER).toHaveBeenCalled();
		expect(fetch).toHaveBeenCalledWith(`${apiPath}/discount-codes`, {
			method: "GET",
			headers: mockHeaders,
		});
		expect(trackPromise).toHaveBeenCalled();
	});

});
