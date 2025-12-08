export class SetupPassword {
	public token: string;
	public username: string;
	public password: string;

	constructor(token: string, username: string, password: string) {
		this.token = token;
		this.username = username;
		this.password = password;
	}
}
