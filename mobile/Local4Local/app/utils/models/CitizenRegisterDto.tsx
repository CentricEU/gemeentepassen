export class CitizenRegisterDto {

	public email: string;
	public firstName: string;
	public lastName: string;
	public password: string;
	public retypedPassword: string;
	public passNumber: string;


	constructor(email: string, firstName: string, lastName: string, password: string, retypedPassword: string, passNumber: string) {
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.password = password;
		this.retypedPassword = retypedPassword;
		this.passNumber = passNumber;
	}

}


