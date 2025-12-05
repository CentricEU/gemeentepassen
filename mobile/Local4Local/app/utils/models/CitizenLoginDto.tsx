export class CitizenLoginDto {

	public username: string;
	public password: string;
	public role: string;
	public reCaptchaResponse: string;
	public rememberMe: boolean;

	constructor(username: string, password: string, role: string, reCaptchaResponse: string, rememberMe: boolean) {
		this.username = username;
		this.password = password;
		this.role = role;
		this.reCaptchaResponse = reCaptchaResponse;
		this.rememberMe = rememberMe;
	}

}
