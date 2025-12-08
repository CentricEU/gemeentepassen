import { CitizenGroupAge } from '../_enums/citizen-group-age.enum';
import { GenericTableData } from './generic-table-data.model';

export class CitizenGroupViewDto extends GenericTableData {
	public id: string;
	public groupName: string;
	public ageGroup: CitizenGroupAge[];
	public isDependentChildrenIncluded: boolean;
	public thresholdAmount: number;
	public maxIncome: number;

	constructor(
		id: string,
		groupName: string,
		ageGroup: CitizenGroupAge[],
		isDependentChildrenIncluded: boolean,
		thresholdAmount: number,
		maxIncome: number,
	) {
		super();
		this.id = id;
		this.groupName = groupName;
		this.ageGroup = ageGroup;
		this.isDependentChildrenIncluded = isDependentChildrenIncluded;
		this.thresholdAmount = thresholdAmount;
		this.maxIncome = maxIncome;
	}
}
