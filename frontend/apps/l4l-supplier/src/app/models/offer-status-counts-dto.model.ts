export class OfferStatusCountsDto {
	public activeCount: number;
	public expiredCount: number;
	public pendingCount: number;
	[key: string]: number | undefined;
}
