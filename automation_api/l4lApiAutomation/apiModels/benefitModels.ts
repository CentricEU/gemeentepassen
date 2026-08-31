export interface BenefitRequestDto {
	name?: string;
	description?: string;
	startDate: string;
	expirationDate: string;
	amount?: number;
	citizenGroupIds: string[];
}

export interface BenefitResponseDto {
	id: string;
	name?: string;
	description?: string;
	startDate: string;
	expirationDate: string;
	amount?: number;
	status: 'ACTIVE' | 'EXPIRED';
	citizenGroupsDto?: CitizenGroupViewDto[];
	remainingAmount?: number;
	spentPercentage?: number;
}

export interface CitizenGroupViewDto {
	id: string;
	groupName?: string;
}
