import { Tenant } from "./tenantModels";

export interface Grant {
	id: string;
	title: string;
	description: string;
	amount: number;
	createFor: string;
	startDate: Date;
	expirationDate: Date;
	tenant: Tenant;
}