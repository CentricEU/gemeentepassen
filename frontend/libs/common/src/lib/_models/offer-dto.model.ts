import { RestrictionsDto } from './restrictions.model';

export class OfferDto {
	public id?: string;
	public title: string;
	public description: string;
	public amount?: number;
	public citizenOfferType: string;
	public offerTypeId: number;
	public startDate: Date;
	public expirationDate: Date;
	public benefitId: string;
	public restrictionRequestDto?: RestrictionsDto;
	constructor(
		id: string,
		title: string,
		description: string,
		amount: number,
		citizenOfferType: string,
		offerTypeId: number,
		startDate: Date,
		expirationDate: Date,
		benefitId: string,
		restrictions?: RestrictionsDto,
	) {
		this.id = id;
		this.title = title;
		this.description = description;
		this.amount = amount;
		this.citizenOfferType = citizenOfferType;
		this.offerTypeId = offerTypeId;
		this.startDate = startDate;
		this.expirationDate = expirationDate;
		this.benefitId = benefitId;
		this.restrictionRequestDto = restrictions;
	}
}
