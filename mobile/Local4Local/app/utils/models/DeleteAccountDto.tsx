import { AccountDeletionReason } from "../enums/accountDeletionReason";

export class DeleteAccountDto {

	public accountDeletionReasons: AccountDeletionReason[];

	constructor(accountDeletionReasons: AccountDeletionReason[]) {
		this.accountDeletionReasons = accountDeletionReasons;
	}

}
