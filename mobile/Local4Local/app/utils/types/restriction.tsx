import {FrequencyOfUseEnum} from "../enums/frequencyOfUseEnum";

export type Restrictions = {
	frequencyOfUse : FrequencyOfUseEnum;
	ageRestriction : number;
	minPrice: number;
	maxPrice: number;
	timeFrom: string;
	timeTo: string;
}
