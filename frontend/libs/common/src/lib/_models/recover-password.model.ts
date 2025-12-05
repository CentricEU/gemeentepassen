export class RecoverPassword {
	public email: string;
	public reCaptchaResponse: string;
	public role: string;

	constructor(email: string, reCaptchaResponse: string, role: string) {
		this.email = email;
		this.reCaptchaResponse = reCaptchaResponse;
		this.role = role;
	}
}
