import { GenericStatusEnum } from '../_enums/generic-status.enum';
import { BenefitDto } from './benefit-dto.model';
import { GenericTableData } from './generic-table-data.model';
import { RestrictionsDto } from './restrictions.model';

//Todo: merge with OfferDto with OfferTableDto and check if benefitName is needed since benefitDto has name property

export class OfferTableDto extends GenericTableData {
	public id?: string;
	public title: string;
	public amount?: number;
	public citizenOfferType: string;
	// To-do why we have both offerType and offerTypeId?
	public offerType: string;
	public offerTypeId: number;
	public validity: string;
	public supplierId: string;
	public status: GenericStatusEnum;
	public benefit: BenefitDto;
	public benefitName: string;
	public supplierName?: string;
	public restrictionRequestDto?: RestrictionsDto; 

	constructor(
		id: string,
		title: string,
		amount: number,
		citizenOfferType: string,
		offerType: string,
		offerTypeId: number,
		validity: string,
		status: GenericStatusEnum,
		supplierName = '',
		supplierId: string,
		benefit: BenefitDto,
		benefitName: string,
		restrictions?: RestrictionsDto,
	) {
		super();
		this.id = id;
		this.title = title;
		this.amount = amount;
		this.citizenOfferType = citizenOfferType;
		this.offerType = offerType;
		this.offerTypeId = offerTypeId;
		this.validity = validity;
		this.status = status;
		this.supplierName = supplierName;
		this.supplierId = supplierId;
		this.benefit = benefit;
		this.benefitName = benefitName;
		this.restrictionRequestDto = restrictions;
	}
}
