import { CitizenGroupAge } from '../_enums/citizen-group-age.enum';
import { EligibilityCriteria } from '../_enums/eligibility-criteria.enum';
import { RequiredDocuments } from '../_enums/required-documents.enum';

export class CitizenGroupDto {
	groupName: string;
	ageGroup: CitizenGroupAge[];
	isDependentChildrenIncluded: boolean;
	thresholdAmount: number;
	maxIncome: number;
	eligibilityCriteria: EligibilityCriteria[];
	requiredDocuments: RequiredDocuments[];

	constructor(
		groupName = '',
		ageGroup: CitizenGroupAge[] = [],
		isDependentChildrenIncluded = false,
		thresholdAmount = 0,
		maxIncome = 0,
		eligibilityCriteria: EligibilityCriteria[] = [],
		requiredDocuments: RequiredDocuments[] = [],
	) {
		this.groupName = groupName;
		this.ageGroup = ageGroup;
		this.isDependentChildrenIncluded = isDependentChildrenIncluded;
		this.thresholdAmount = thresholdAmount;
		this.maxIncome = maxIncome;
		this.eligibilityCriteria = eligibilityCriteria;
		this.requiredDocuments = requiredDocuments;
	}
}
