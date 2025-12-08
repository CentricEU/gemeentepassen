import { trackPromise } from "react-promise-tracker";
import { AUTH_HEADER } from "../utils/constants/headers";
import api from "../utils/auth/api-interceptor";
import { StatusCode } from "../utils/enums/statusCode.enum";

class OfferSearchHistoryService {
  static async getSearchHistoryForCitizen(): Promise<string[]> {
    const HEADERS_WITH_AUTH = await AUTH_HEADER();

    try {
      const response = await trackPromise(
        api.get("/search-history", { headers: HEADERS_WITH_AUTH })
      );

      if (response.status !== StatusCode.Ok) {
        throw Error(response.status.toString());
      }

      const data = await response.data;
      return data;
    } catch (error) {
      console.error("Error fetching search history:", error);
      return [];
    }
  }
}

export default OfferSearchHistoryService;