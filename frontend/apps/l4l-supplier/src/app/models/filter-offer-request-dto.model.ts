import { GenericStatusEnum } from '@frontend/common';

export class FilterOfferRequestDto {
	public status: GenericStatusEnum;
	public offerTypeId: number;
	public grantId: string;

	constructor(status: GenericStatusEnum, offerTypeId: number, grantId: string) {
		this.status = status;

		this.offerTypeId = offerTypeId;
		this.grantId = grantId;
	}
}
