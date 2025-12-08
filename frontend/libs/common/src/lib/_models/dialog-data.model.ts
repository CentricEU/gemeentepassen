export class WarningDialogData {
	comments: string;
	tenantName: string;
	reason: string;
	email: string;

	constructor(comments = '-', tenantName = '', reason = '', email = '') {
		this.comments = comments;
		this.tenantName = tenantName;
		this.reason = reason;
		this.email = email;
	}
}
