import { Component, Input, OnChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { CitizenIdentityDto } from '../../shared/models/citizen-identity-dto.model';
import { InputField } from '../../shared/models/input-field.model';
import { EligibleBenefitsComponent } from '../eligible-benefits/eligible-benefits.component';

@Component({
	selector: 'app-check-and-send',
	imports: [TranslateModule, WindmillModule, EligibleBenefitsComponent],
	templateUrl: './check-and-send.component.html',
	styleUrl: './check-and-send.component.scss',
})
export class CheckAndSendComponent implements OnChanges {
	@Input() checkAndSendFormGroup!: FormGroup;
	@Input() inputFields!: InputField[];
	@Input() citizenIdentity!: CitizenIdentityDto;
	@Input() filesAdded!: File[];
	@Input() additionalMessage!: string;
	@Input() isStepActive = false;

	public ngOnChanges(): void {
		if (this.checkAndSendFormGroup && this.additionalMessage !== undefined) {
			this.updateFormWithAdditionalMessage();
		}
	}

	public controlSuffix = '-check-and-send';
	public updateFormWithCitizenData(data: CitizenIdentityDto): void {
		if (!this.checkAndSendFormGroup || !data) {
			return;
		}
		this.checkAndSendFormGroup.patchValue({
			lastName: data.lastName,
			firstName: data.firstName,
			bsn: data.bsnNumber,
			birthdate: data.birthDate,
			telephone: data.telephone,
			email: data.email,
			additionalMessage: this.additionalMessage,
		});
	}

	public updateFormWithAdditionalMessage(): void {
		if (!this.checkAndSendFormGroup) {
			return;
		}
		this.checkAndSendFormGroup.patchValue({
			additionalMessage: this.additionalMessage,
		});
	}
}
