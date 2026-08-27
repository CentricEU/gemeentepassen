import { BenefitDto } from './benefit-dto.model';
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
	public benefits: BenefitDto[];
	public version: number;
	public restrictionRequestDto?: RestrictionsDto;
	public benefitIds?: string[];
	constructor(
		id: string,
		title: string,
		description: string,
		amount: number,
		citizenOfferType: string,
		offerTypeId: number,
		startDate: Date,
		expirationDate: Date,
		benefits: BenefitDto[],
		version: number,
		restrictionRequestDto?: RestrictionsDto,
		benefitIds?: string[],
	) {
		this.id = id;
		this.title = title;
		this.description = description;
		this.amount = amount;
		this.citizenOfferType = citizenOfferType;
		this.offerTypeId = offerTypeId;
		this.startDate = startDate;
		this.expirationDate = expirationDate;
		this.benefits = benefits;
		this.restrictionRequestDto = restrictionRequestDto;
		this.version = version;
		this.benefitIds = benefitIds;
	}
}
