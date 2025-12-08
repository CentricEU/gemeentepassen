import api from "../utils/auth/api-interceptor";
import { trackPromise } from "react-promise-tracker";
import { AUTH_HEADER } from "../utils/constants/headers";
import { StatusCode } from "../utils/enums/statusCode.enum";

class DiscountCodeService {
	static async getDiscountCode(offerId: string): Promise<any> {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const requestObj = {
				method: "GET",
				headers: HEADERS_WITH_AUTH,
			};

			const response = await trackPromise(
				api.get(`/discount-codes/${encodeURIComponent(offerId)}`, requestObj)
			);

			if (response.status !== StatusCode.Ok) {
				throw Error(response.status.toString());
			}

			return response.data;
		} catch (error) {
			throw error;
		}
	}

	static async getAllDiscountCodes(): Promise<any> {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const response = await trackPromise(
				api.get(`/discount-codes`, { headers: HEADERS_WITH_AUTH })
			);

			if (response.status !== StatusCode.Ok) {
				throw new Error(response.statusText);
			}

			return response.data;
		} catch (error) {
			throw error;
		}
	}
}

export default DiscountCodeService;
