import { GrantDto } from './grant-dto.model';
import { OfferTableDto } from './offer-table-dto.model';

export class OfferInformationDto extends OfferTableDto {
	public grants?: GrantDto[];
	public description: string;
	public startDate: Date;
	public expirationDate: Date;
}
