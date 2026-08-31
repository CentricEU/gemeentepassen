export interface Passholder {
	id: string;
	name: string;
	bsn: string;
	expiringDate: Date;
	passNumber: string;
	residenceCity: string;
	address: string;
	isRegistered: boolean;
	citizenGroupName: string;
}

export interface FilterPassholdersRequest {
	bsn?: string;
	passNumber?: string;
}
