import { GenericTableData } from '@frontend/common';

export class InvitationDto extends GenericTableData {
	public email: string;
	public createdDate: Date | string;
	public message: string;

	constructor(email: string, sendingDate: Date | string, message: string) {
		super();
		this.email = email;
		this.createdDate = sendingDate;
		this.message = message;
	}
}
