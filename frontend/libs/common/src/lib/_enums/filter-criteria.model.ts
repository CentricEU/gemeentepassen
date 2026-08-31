import { GenericStatusEnum } from './generic-status.enum';

export class FilterCriteria {
	statusFilter?: GenericStatusEnum;
	offerTypeFilter?: number;
	benefitFilter?: string;
	supplierNameFilter?: string;
	bsnFilter?: string;
	passholderNumberFilter?: string;
}
