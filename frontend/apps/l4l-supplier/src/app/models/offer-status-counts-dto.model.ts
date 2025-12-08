export class OfferStatusCountsDto {
	public activeCount: number;
	public expiredCount: number;
	public pendingCount: number;
	public noDataCount: number;
	[key: string]: number | undefined;
}
