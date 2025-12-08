export class PassDto {
	firstName: string; // max 64 chars, required
	lastName: string; // max 64 chars, required
	birthday: string; // ISO date string, required
	bsn: string; // max 9 chars, required
	contactPhone: string; // max 15 chars, required
	contactEmail: string; // required, valid email
	additionalInfo?: string; // max 255 chars, optional

	constructor(
		firstName: string,
		lastName: string,
		birthday: string,
		bsn: string,
		contactPhone: string,
		contactEmail: string,
		additionalInfo?: string,
	) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.birthday = birthday;
		this.bsn = bsn;
		this.contactPhone = contactPhone;
		this.contactEmail = contactEmail;
		this.additionalInfo = additionalInfo;
	}
}
