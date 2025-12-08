import { Component, inject } from '@angular/core';
import { DialogService } from '@windmill/ng-windmill/dialog';

@Component({
	selector: 'frontend-terms-and-conditions-dialog',
	templateUrl: './terms-and-conditions-dialog.component.html',
	styleUrls: ['./terms-and-conditions-dialog.component.scss'],
	standalone: false,
})
export class TermsAndConditionsDialogComponent {
	private readonly dialogService = inject(DialogService);

	public promises = [
		{ key: 'purpose' },
		{ key: 'basis' },
		{ key: 'minimization' },
		{ key: 'transparency' },
		{ key: 'safety' },
	];

	public rights = ['access', 'correction', 'forgotten', 'portability', 'restriction', 'automated', 'objection'];

	public closeDialog(): void {
		this.dialogService.closeAll();
	}
}
