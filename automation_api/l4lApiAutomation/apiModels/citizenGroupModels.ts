export interface CitizenGroupDto {
	id?: string;
	groupName?: string;
	ageGroup: ('UNDER_18' | 'AGE_18_64' | 'AGE_65_PLUS')[];
	isDependentChildrenIncluded?: boolean;
	thresholdAmount: number;
	maxIncome: number;
	eligibilityCriteria?: ('HAS_EXISTING_DIGID' | 'IS_AGE_18_OR_OLDER' | 'RESIDES_IN_CITY' | 'IS_NOT_A_STUDENT')[];
	requiredDocuments?: ('PROOF_OF_IDENTITY' | 'INCOME_PROOF' | 'ASSETS' | 'DEBTS_OR_ALIMONY_OBLIGATIONS')[];
}

export interface CitizenMessageDto {
	message: string;
}

export interface CitizenGroupViewDto {
	id: string;
	groupName?: string;
	ageGroup?: ('UNDER_18' | 'AGE_18_64' | 'AGE_65_PLUS')[];
	isDependentChildrenIncluded?: boolean;
	thresholdAmount?: number;
	maxIncome?: number;
}
