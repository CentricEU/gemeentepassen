
import { CitizenRegisterDto } from "../app/utils/models/CitizenRegisterDto";
import { CitizenProfileDto } from "../app/utils/models/CitizenProfileDto";

class MockUserService {
	static async registerUser(data: CitizenRegisterDto) {
		// @ts-ignore
		return Promise.resolve({ success: true, message: "User registered" });
	}

	static async getCitizenProfile() {
		// @ts-ignore
		const newCitizen = new CitizenProfileDto('username','firstName','lastName');
		return Promise.resolve(newCitizen);
	}

	static async login() {
		// @ts-ignore
		const newCitizen = new CitizenProfileDto('username','firstName','lastName');
		return Promise.resolve(newCitizen);
	}
}


export default MockUserService;
