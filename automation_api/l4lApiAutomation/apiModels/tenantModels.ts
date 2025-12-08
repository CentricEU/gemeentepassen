export interface Tenant {
	id: string;
	name: string;
	address: string;
	createdDate: Date;
	iban: string;
	bic?: string;
	wage: number;
}