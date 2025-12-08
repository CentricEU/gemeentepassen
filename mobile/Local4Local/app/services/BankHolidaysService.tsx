import api from "../utils/auth/api-interceptor";
import { trackPromise } from "react-promise-tracker";
import { AUTH_HEADER } from "../utils/constants/headers";
import { StatusCode } from "../utils/enums/statusCode.enum";

class BankHolidaysService {

	static async getHolidays(year: number) {
		try {

			const HEADERS_WITH_AUTH = await AUTH_HEADER();

			const requestObj = {
				method: "GET",
				headers: HEADERS_WITH_AUTH,
			};

			const response = await trackPromise(api.get(`/bank-holidays?year=${year}`, requestObj));

			if (response.status !== StatusCode.Ok) {
				throw Error(response.status.toString());
			}

			return response.data;
		} catch (error) {
			throw error;
		}
	}
}

export default BankHolidaysService;