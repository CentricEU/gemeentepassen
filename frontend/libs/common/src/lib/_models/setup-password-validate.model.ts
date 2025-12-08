export class SetupPasswordValidate {
	public token: string;
	public username: string;

	constructor(token: string, username: string) {
		this.token = token;
		this.username = username;
	}
}
