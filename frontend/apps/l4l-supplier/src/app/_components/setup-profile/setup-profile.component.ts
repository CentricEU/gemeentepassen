import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
	AuthService,
	FormUtil,
	GeneralInformation,
	ModalData,
	PdokService,
	PdokUtil,
	SidenavService,
	SupplierCoordinates,
	SupplierProfileDto,
	UserDto,
	UserService,
} from '@frontend/common';
import {
	ContactInformationComponent,
	CustomDialogComponent,
	CustomDialogConfigUtil,
	GeneralInformationComponent,
	WorkingHoursEditComponent,
} from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { CentricHorizontalStepperComponent, DialogService, ToastrService } from '@windmill/ng-windmill';
import { of, switchMap } from 'rxjs';

import { SetupProfileService } from '../../services/supplier-profile-service/setup-profile-service/setup-profile.service';

@Component({
	selector: 'frontend-setup-profile',
	templateUrl: './setup-profile.component.html',
	styleUrls: ['./setup-profile.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetupProfileComponent implements AfterViewInit {
	@ViewChild('contactInformation') contactInformation: ContactInformationComponent;
	@ViewChild('generalInformation') generalInformation: GeneralInformationComponent;
	@ViewChild('workingHoursEdit') workingHoursEdit: WorkingHoursEditComponent;
	@ViewChild('horizontalStepper') horizontalStepper: CentricHorizontalStepperComponent;

	public maxLines = 1;
	public shouldDisplaySuccessfulSetupDialog = false;
	public contactInformationForm: FormGroup = new FormGroup([]);
	public generalInformationForm: FormGroup = new FormGroup([]);

	public formatDate = FormUtil.formatDate;

	private supplierId: string;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		private readonly dialogService: DialogService,
		private readonly dialogRef: MatDialogRef<SetupProfileComponent>,
		private setupProfileService: SetupProfileService,
		private userService: UserService,
		private cdr: ChangeDetectorRef,
		private authService: AuthService,
		private pdokService: PdokService,
		private sidenavService: SidenavService,
		private toastrService: ToastrService,
		private translateService: TranslateService,
	) {
		this.dialogRef.disableClose = true;
	}

	public ngAfterViewInit(): void {
		this.generalInformationForm = this.generalInformation.generalInformationForm;
		this.contactInformationForm = this.contactInformation.contactInformationForm;

		this.cdr.detectChanges();
	}

	public goToNextStep(): void {
		this.horizontalStepper.next();
	}

	public goToPreviousStep(): void {
		this.horizontalStepper.previous();
	}

	public shouldShowFinishButton(): boolean {
		const isGeneralValid = this.contactInformationForm?.valid && this.generalInformationForm?.valid;
		const isLastStep = this.horizontalStepper?.selectedIndex === 2;
		const isWorkingHoursValid = this.workingHoursEdit?.isFormValid();

		return isGeneralValid && (isLastStep || isWorkingHoursValid);
	}

	public shouldDisableFinishButton(): boolean {
		const contactFormInvalid = this.contactInformationForm?.invalid;
		const generalFormInvalid = this.generalInformationForm?.invalid;
		const workingHourEditFormInvalid = !this.workingHoursEdit?.isFormValid();

		return contactFormInvalid || generalFormInvalid || workingHourEditFormInvalid;
	}

	public shouldDisableNextButton(): boolean {
		const isFirstStep = this.horizontalStepper.selectedIndex === 0;
		const isSecondStep = this.horizontalStepper.selectedIndex === 1;
		const firstStepValid = this.generalInformationForm?.valid;
		const secondStepValid = this.contactInformationForm?.valid;

		return (isFirstStep && !firstStepValid) || (isSecondStep && !secondStepValid);
	}

	public shouldDisableBackButton(): boolean {
		return this.horizontalStepper?.selectedIndex === 0;
	}

	public shouldShowNextButton(): boolean {
		return this.horizontalStepper?.selectedIndex < 2;
	}

	public saveSupplierSetupProfile(): void {
		this.dialogRef.close();
		const supplierProfileDto = this.mapSupplierProfile();

		this.pdokService
			.getCoordinateFromAddress(supplierProfileDto.branchLocation, supplierProfileDto.branchZip)
			.pipe(
				switchMap((data) => {
					if (!data.response.numFound) {
						this.displayErrorToaster();
						return of(null);
					}

					const coordinates: SupplierCoordinates = PdokUtil.getCoordinatesFromPdok(data);
					supplierProfileDto.latlon = coordinates;
					return this.setupProfileService.saveSupplierProfile(supplierProfileDto);
				}),
			)
			.subscribe((result) => {
				if (!result) {
					return;
				}

				this.displayApprovalWaitingPopup();
				this.removeLocalStorageData();
				this.updateUserInformation();
			});
	}

	public onCurrentSupplierId(supplierId: string): void {
		this.supplierId = supplierId;
	}

	public logout(): void {
		this.authService.logout();
		this.dialogRef.close();
		this.sidenavService.reloadCurrentRoute();
	}

	private displayApprovalWaitingPopup(): void {
		this.shouldDisplaySuccessfulSetupDialog = true;
		const approvalWaitingModalData = new ModalData(
			'setupProfile.setupSuccessful',
			'setupProfile.setupSuccessful',
			'setupProfile.success.text',
			'general.button.cancel',
			'setupProfile.continue',
			false,
			'success',
			'theme',
			'wait-clock.svg',
		);

		this.dialogService.message(
			CustomDialogComponent,
			CustomDialogConfigUtil.createMessageModal(approvalWaitingModalData),
		);
	}

	private removeLocalStorageData(): void {
		localStorage.removeItem('generalFormInformation');
		localStorage.removeItem('contactFormInformation');
		localStorage.removeItem('workingHours');
	}

	private mapSupplierProfile(): SupplierProfileDto {
		const { legalForm, group, category, subcategory, ...generalInformationFormValue }: GeneralInformation =
			this.generalInformationForm.value;
		const contactInformationFormValue = this.contactInformationForm.value;

		const supplierProfileDto: SupplierProfileDto = {
			...contactInformationFormValue,
			...generalInformationFormValue,
			legalForm: parseInt(legalForm, 10),
			group: parseInt(group, 10),
			category: parseInt(category, 10),
			subcategory: parseInt(subcategory, 10),
			supplierId: this.supplierId,
			workingHours: this.workingHoursEdit.mapWorkingHours(),
		};

		return supplierProfileDto;
	}

	private updateUserInformation(): void {
		this.userService.userInformationObservable.subscribe((data) => {
			const updatedUser: UserDto = {
				...data,
				isProfileSet: true,
			};
			this.userService.addUserInformation(updatedUser);
		});
	}

	private displayErrorToaster(): void {
		const toasterMessage = this.translateService.instant(`setupProfile.invalidZipCode`);

		this.toastrService.error(`<p>${toasterMessage}</p>`, '', {
			toastBackground: 'toast-light',
			enableHtml: true,
			progressBar: true,
			tapToDismiss: true,
			timeOut: 8000,
			extendedTimeOut: 8000,
		});
	}
}
