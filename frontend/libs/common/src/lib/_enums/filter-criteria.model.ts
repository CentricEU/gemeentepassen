import { GenericStatusEnum } from './generic-status.enum';

export class FilterCriteria {
	statusFilter?: GenericStatusEnum;
	offerTypeFilter?: number;
	grantsFilter?: string;
}
