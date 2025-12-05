import { UseOfferDto } from "../app/utils/models/UseOfferDto";
import { CitizenOfferType } from "../app/utils/enums/citizenOfferType";
import { WorkingHour } from "../app/utils/models/WorkingHour";

class MockOfferService {
	static async useOffer(data: UseOfferDto) {
		// @ts-ignore
		return Promise.resolve({ success: true, message: "Offer used successfully" });
	}

	static async getFullOffer(offerID: string) {
		// @ts-ignore
		return Promise.resolve({
			id: `offerId`,
			title: `Test Offer`,
			description: `Test Description`,
			amount: 100,
			citizenOfferType: CitizenOfferType.citizenWithPass,
			offerType: {
				offerTypeId: 0,
				offerTypeLabel: 'offerLabel'
			},
			// @ts-ignore
			startDate: new Date(),
			// @ts-ignore
			expirationDate: new Date(),
			coordinatesString: "{\"longitude\":45, \"latitude\":45}",
			companyName: `Test Company`,
			distance: 10,
			grants: [],
			companyAddress: `Test Address`,
			companyLogo: `Test Logo`,
			workingHours: [new WorkingHour("id1", 0, "08:00:00", "16:00:00", true), new WorkingHour("id2", 1, "08:00:00", "16:00:00", true)],
			restrictions: {"ageRestriction": 21}
		});
	}
}

export default MockOfferService;
