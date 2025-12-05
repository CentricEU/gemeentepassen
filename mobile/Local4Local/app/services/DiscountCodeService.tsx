import { AUTH_HEADER } from "../utils/constants/headers";
import { trackPromise } from "react-promise-tracker";
import { apiPath } from "../utils/constants/api";

class DiscountCodeService {
	static async getDiscountCode(offerId: string): Promise<any> {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const requestObj = {
				method: "GET",
				headers: HEADERS_WITH_AUTH,
			};

			const response = await trackPromise(
				fetch(
					`${apiPath}/discount-codes/${encodeURIComponent(offerId)}`,
					requestObj
				)
			);

			if (!response.ok) {
				throw Error(response.status.toString());
			}

			return response.json();
		} catch (error) {
			throw error;
		}
	}

	static async getAllDiscountCodes(): Promise<any> {
		try {
			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const response = await trackPromise(
				fetch(`${apiPath}/discount-codes`, {
					method: "GET",
					headers: HEADERS_WITH_AUTH,
				})
			);

			if (!response.ok) {
				throw new Error(response.statusText);
			}

			return response.json();
		} catch (error) {
			throw error;
		}
	}
}

export default DiscountCodeService;
