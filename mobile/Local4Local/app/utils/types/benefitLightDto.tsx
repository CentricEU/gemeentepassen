export type BenefitLightDto = {
	id: string;
	name: string;
	description: string;
	startDate: Date;
	expirationDate: Date;
	amount: number;
	status: string;
	remainingAmount: number;
	spentPercentage: number;
};
