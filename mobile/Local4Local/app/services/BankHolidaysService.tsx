import { apiPath } from "../utils/constants/api";
import { AUTH_HEADER } from "../utils/constants/headers";
import { trackPromise } from "react-promise-tracker";

class BankHolidaysService {

	static async getHolidays(year: number) {
		try {

			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const requestObj = {
				method: "GET",
				headers: HEADERS_WITH_AUTH,
			};

			const response = await trackPromise( fetch(`${apiPath}/bank-holidays?year=${year}`, requestObj));

			if (!response.ok) {
				throw Error(response.status.toString());
			}

			return response.json();
		} catch (error) {
			throw error;
		}
	}
}

export default BankHolidaysService;