export class WarningDialogData {
	comments: string;
	tenantName: string;
	reason: string;
	email: string;

	constructor(comments: string = '-', tenantName: string = '', reason: string = '', email: string = '') {
		this.comments = comments;
		this.tenantName = tenantName;
		this.reason = reason;
		this.email = email;
	}
}
