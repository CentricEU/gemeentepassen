export interface OfferStatisticsDto {
	offerTypeId: number;
	offerTypeLabel: string;
	citizenCount: number;
}

export interface MonthlyTransactionDto {
	month: number;
	totalAmount: number;
}

export interface DashboardCountDto {
	passholdersCount: number;
	suppliersCount: number;
	transactionsCount: number;
}

export type IntervalPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export type SupplierStatus = 'CREATED' | 'PENDING' | 'APPROVED' | 'REJECTED';
