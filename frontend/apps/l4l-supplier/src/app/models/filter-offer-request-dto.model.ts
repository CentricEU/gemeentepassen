import { GenericStatusEnum } from '@frontend/common';

export class FilterOfferRequestDto {
	public status: GenericStatusEnum;
	public offerTypeId: number;
	public benefitId: string;

	constructor(status: GenericStatusEnum, offerTypeId: number, benefitId: string) {
		this.status = status;

		this.offerTypeId = offerTypeId;
		this.benefitId = benefitId;
	}
}
