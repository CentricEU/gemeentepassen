import { CitizenGroupAge } from '@frontend/common';

export class CitizenGroupCardData {
	categoryTitle: string;
	ageGroup: CitizenGroupAge[];
	dependentChildren: boolean;
	maxIncome: number;
	selected: boolean;
	isReadonly: boolean;
}
