import { OfferTableDto } from './offer-table-dto.model';

export class OfferInformationDto extends OfferTableDto {
	public description: string;
	public startDate: Date;
	public expirationDate: Date;
}
