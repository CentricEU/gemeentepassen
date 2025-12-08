export class MunicipalityStatistics {
	public suppliersCount: number;
	public transactionsCount: number;
	public passholdersCount: number;

	constructor(suppliersCount: number, transactionsCount: number, passholdersCount: number) {
		this.suppliersCount = suppliersCount;
		this.transactionsCount = transactionsCount;
		this.passholdersCount = passholdersCount;
	}
}
