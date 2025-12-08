export enum CitizenGroupAge {
	UNDER_18 = 'UNDER_18',
	AGE_18_64 = 'AGE_18_64',
	AGE_65_PLUS = 'AGE_65_PLUS',
}

export const CitizenGroupAgeMapping: () => Map<CitizenGroupAge, string> = () =>
	new Map([
		[CitizenGroupAge.UNDER_18, '0-17'],
		[CitizenGroupAge.AGE_18_64, '18-66'],
		[CitizenGroupAge.AGE_65_PLUS, '67+'],
	]);
