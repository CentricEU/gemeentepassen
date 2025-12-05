export class CitizenProfileDto {

	public username: string;
	public firstName: string;
	public lastName: string;
	public address?: string;
	public telephone?: string;

	constructor(username: string, firstName: string, lastName: string, address?: string, telephone?: string) {
		this.username = username;
		this.firstName = firstName;
		this.lastName = lastName;
		this.address = address;
		this.telephone = telephone;

	}
}
