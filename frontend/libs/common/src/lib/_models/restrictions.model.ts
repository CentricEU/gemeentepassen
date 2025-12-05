import { FrequencyOfUse } from '../_enums/frequency-of-use.enum';

export class RestrictionsDto {
	public ageRestriction?: number;
	public frequencyOfUse?: FrequencyOfUse | undefined;
	public minPrice?: number;
	public maxPrice?: number;
	public timeFrom?: string;
	public timeTo?: string;
	[key: string]: string | number | undefined | Date;
}
