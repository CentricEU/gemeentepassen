import { FrequencyOfUse } from '../_enums/frequency-of-use.enum';

export class RestrictionsDto {
	public frequencyOfUse?: FrequencyOfUse | undefined;
	public timeFrom?: string;
	public timeTo?: string;
	[key: string]: string | number | undefined | Date;
}
