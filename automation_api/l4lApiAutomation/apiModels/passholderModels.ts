import { Grant } from "./grantModels";
import { Tenant } from "./tenantModels";

export interface Passholder{
	id: string;
	name: string;
	bsn: string;
	expiringDate: Date;
	passNumber: string;
	residenceCity: string;
	address: string;
	grants: Grant[];
	isRegistered: boolean;
	tenant: Tenant;
}