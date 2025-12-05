import { trackPromise } from "react-promise-tracker";
import { apiPath } from "../utils/constants/api";
import { AUTH_HEADER, HEADERS } from "../utils/constants/headers";
import { CitizenLoginDto } from "../utils/models/CitizenLoginDto";
import { CitizenRegisterDto } from "../utils/models/CitizenRegisterDto";
import { DeleteAccountDto } from "../utils/models/DeleteAccountDto";
import { CitizenProfileDto } from "../utils/models/CitizenProfileDto";

class UserService {
  static async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData;

      throw new Error(errorMessage);
    }
    return response.json();
  }

  static async registerUser(data: CitizenRegisterDto) {
    try {
      const response = await trackPromise(
        fetch(`${apiPath}/users/register`, {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify(data),
        })
      );
      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  static async login(data: CitizenLoginDto) {
    try {
      const response = await trackPromise(
        fetch(`${apiPath}/authenticate`, {
          method: "POST",
          headers: HEADERS,
          body: JSON.stringify(data),
        })
      );
      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  static async resendConfirmationToken(email: string) {
    try {
      const response = await trackPromise(
        fetch(
          `${apiPath}/users/resend-confirmation?email=${encodeURIComponent(
            email
          )}`,
          {
            method: "GET",
            headers: HEADERS,
          }
        )
      );
      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  static async getCitizenProfile(): Promise<CitizenProfileDto> {
    try {
      const HEADERS_WITH_AUTH = await AUTH_HEADER();

      const requestObj = {
        method: "GET",
        headers: HEADERS_WITH_AUTH,
      };

      const response = await trackPromise(
        fetch(`${apiPath}/users/citizen-profile`, requestObj)
      );

      if (!response.ok) {
        throw Error(response.status.toString());
      }

      return response.json();
    } catch (error) {
      throw error;
    }
  }

  static async deleteAccount(data: DeleteAccountDto): Promise<void> {
    try {
      const HEADERS_WITH_AUTH = await AUTH_HEADER();

      await trackPromise(
        fetch(`${apiPath}/users/delete-account`, {
          method: "POST",
          headers: HEADERS_WITH_AUTH,
          body: JSON.stringify(data),
        })
      );
    } catch (error) {
      throw error;
    }
  }

  static async updateUserInformation(data: CitizenProfileDto): Promise<CitizenProfileDto> {
    try {
      const HEADERS_WITH_AUTH = await AUTH_HEADER();
      const response = await trackPromise(
        fetch(`${apiPath}/users/citizen-profile`, {
          method: "POST",
          headers: HEADERS_WITH_AUTH,
          body: JSON.stringify(data),
        })
      );
    
      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

}

export default UserService;
