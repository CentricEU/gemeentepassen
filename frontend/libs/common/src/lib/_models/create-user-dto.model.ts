export class CreateUserDto {
	firstName: string;
	lastName: string;
	email: string;
	isSuperAdmin?: boolean;

	constructor(firstName: string, lastName: string, email: string, isSuperAdmin?: boolean) {
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.isSuperAdmin = isSuperAdmin ?? false;
	}
}
