import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FormUtil } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { MarkAsteriskDirective } from '../../shared/directives/mark-asterisk/asterisk.directive';
import { CitizenIdentityDto } from '../../shared/models/citizen-identity-dto.model';

@Component({
	selector: 'app-confirm-identity',
	imports: [TranslateModule, WindmillModule, MarkAsteriskDirective],
	templateUrl: './confirm-identity.component.html',
	styleUrls: ['./confirm-identity.component.scss'],
})
export class ConfirmIdentityComponent {
	@Input() confirmIdentityFormGroup!: FormGroup;
	@Input() inputFields!: {
		labelKey: string;
		controlName: string;
		id: string;
		name: string;
	}[];
	@Input() isStepActive = false;
	@Output() inputValueChanged = new EventEmitter<string | number>();

	public validationFunctionError = FormUtil.validationFunctionError;
	public hasControlErrorsAndTouched = FormUtil.hasControlErrorsAndTouched;
	public getEmailErrorMessage = FormUtil.getEmailErrorMessage;
	public controlSuffix = '-confirm-identity';

	public checkEmailControl(): boolean {
		return !!(this.confirmIdentityFormGroup && this.confirmIdentityFormGroup.get('email'));
	}

	public updateFormWithInitialData(data: CitizenIdentityDto): void {
		if (!this.confirmIdentityFormGroup || !data) {
			return;
		}
		this.confirmIdentityFormGroup.patchValue({
			lastName: data.lastName,
			firstName: data.firstName,
			bsn: data.bsnNumber,
			birthdate: data.birthDate,
			telephone: data.telephone,
			email: data.email,
		});
	}

	public onEmailValueChanged(value: string | number): void {
		this.inputValueChanged.emit(value);
	}
}
