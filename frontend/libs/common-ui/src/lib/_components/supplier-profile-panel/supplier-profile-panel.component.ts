import { Component, Input, ViewChild } from '@angular/core';
import { SupplierProfile, SupplierProfileService } from '@frontend/common';

import { SupplierProfileComponent } from '../supplier-profile/supplier-profile.component';

@Component({
	selector: 'frontend-supplier-profile-panel',
	templateUrl: './supplier-profile-panel.component.html',
	styleUrls: ['./supplier-profile-panel.component.scss'],
	standalone: false,
})
export class SupplierInformationPanelComponent {
	@ViewChild('profileInformation') supplierProfileInfomationComponent: SupplierProfileComponent;

	@Input() isReadOnly = false;
	@Input() isRejectedStatus = false;

	public get actionButtonText(): string {
		return this.isRejectedStatus ? 'general.button.reapply' : 'general.button.saveChanges';
	}

	public get decodedImage(): string | ArrayBuffer | null {
		return this.supplierProfileInfomationComponent?.decodedImage;
	}

	public get supplierProfileServiceInformation(): SupplierProfile {
		const profileValue = this.supplierProfileService.supplierProfileInformation;
		return profileValue ? profileValue : new SupplierProfile();
	}

	constructor(private supplierProfileService: SupplierProfileService) {}

	public saveChanges(): void {
		this.supplierProfileInfomationComponent.saveChanges(this.isRejectedStatus);
	}

	public suspendSupplier(): void {
		console.log('Out of scope for this PIB');
	}

	public resetChanges(): void {
		console.log('Should be implemented');
	}

	public shouldDisableFinishButton(): boolean {
		const contactFormInvalid = this.supplierProfileInfomationComponent?.contactInformationForm?.invalid;
		const generalFormInvalid = this.supplierProfileInfomationComponent?.generalInformationForm?.invalid;
		const areFormValuesChanged = this.supplierProfileInfomationComponent?.areFormValuesChanged;

		return contactFormInvalid || generalFormInvalid || !areFormValuesChanged;
	}
}
