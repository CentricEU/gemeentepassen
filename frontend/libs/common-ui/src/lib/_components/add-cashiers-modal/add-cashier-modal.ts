import { Component, inject } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonL4LModule, CommonUtil, RegexUtil } from '@frontend/common';
import { TranslateModule } from '@ngx-translate/core';

import { WindmillModule } from '../../windmil.module';

@Component({
	selector: 'frontend-add-cashier-modal',
	imports: [CommonL4LModule, TranslateModule, WindmillModule],
	templateUrl: './add-cashier-modal.html',
	styleUrl: './add-cashier-modal.scss',
})
export class AddCashierModalComponent {
	public hasDuplicateEmailError: boolean;
	public cashierEmailsList = new Set<string>();
	public emailError: string;
	public emailControl = new FormControl('', [Validators.required, Validators.email]);

	private readonly dialogRef = inject(MatDialogRef<AddCashierModalComponent>);

	public addCashiers(): void {
		this.dialogRef.close(this.cashierEmailsList);
	}

	public close(): void {
		this.dialogRef.close();
	}

	public isButtonDisalbed(): boolean {
		return this.cashierEmailsList.size > 0 ? false : true;
	}

	public handleKeydown(event: KeyboardEvent): void {
		if (CommonUtil.isEnterOrSpace(event.key)) {
			event.preventDefault();
			this.handleKeyPressed();
			return;
		}
		const inputText = this.emailControl?.value;
		if (!inputText || inputText.length === 0) {
			this.emailError = '';
		}
	}

	public handleBlur(event: unknown): void {
		if (event === null || event === undefined || event === '') {
			return;
		}
		this.handleKeyPressed();
	}

	public removeEmailFromList(email: string): void {
		this.hasDuplicateEmailError = false;
		this.cashierEmailsList.delete(email);
	}

	private handleKeyPressed(): void {
		const emailRegex = RegexUtil.emailRegexPattern;
		const email = this.emailControl.value;

		if (!email || !emailRegex.test(email)) {
			this.emailError = 'genericFields.email.validEmail';
			return;
		}

		if (this.cashierEmailsList.has(email)) {
			this.emailError = 'inviteSuppliers.emailAlreadyInList';
			return;
		}

		this.hasDuplicateEmailError = false;
		this.cashierEmailsList.add(email);
		this.emailError = '';
		this.emailControl.setValue('');
	}
}
