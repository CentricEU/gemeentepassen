export class CitizenIdentityDto {
	lastName: string;
	firstName: string;
	bsnNumber: string;
	birthDate: string;
	telephone: string;
	email?: string;

	constructor(
		lastName: string,
		firstName: string,
		bsnNumber: string,
		birthDate: string,
		telephone: string,
		email?: string,
	) {
		this.lastName = lastName;
		this.firstName = firstName;
		this.bsnNumber = bsnNumber;
		this.birthDate = birthDate;
		this.telephone = telephone;
		this.email = email;
	}
}
