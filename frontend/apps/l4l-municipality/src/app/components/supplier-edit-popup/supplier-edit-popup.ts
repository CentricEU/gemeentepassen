import { AfterViewChecked, ChangeDetectorRef, Component, inject, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
	CharacterLimitMessageService,
	FormUtil,
	GeneralInformation,
	ModalData,
	PdokService,
	PdokUtil,
	SilentErrorCode,
	SupplierProfile,
	SupplierProfilePatchDto,
	SupplierProfileService,
	SupplierStatus,
	WarningDialogData,
	WorkingHoursDto,
	WorkingHoursService,
} from '@frontend/common';
import {
	CustomDialogComponent,
	CustomDialogConfigUtil,
	GeneralInformationComponent,
	WorkingHoursEditComponent,
} from '@frontend/common-ui';
import { DialogService } from '@windmill/ng-windmill/deprecated-dialog';
import { catchError, finalize, switchMap } from 'rxjs';

import { SupplierRequestPatchDto } from '../../_models/supplier-request-patch-dto.model.';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { SupplierReviewPopupComponent } from '../supplier-review-popup/supplier-review-popup.component';

@Component({
	selector: 'frontend-supplier-edit-popup',
	templateUrl: './supplier-edit-popup.html',
	standalone: false,
	styleUrls: ['./supplier-edit-popup.scss'],
})
export class SupplierEditPopupComponent implements OnInit, AfterViewChecked {
	@Input() isReadOnly = false;

	@ViewChild('workingHoursEdit') workingHoursEdit: WorkingHoursEditComponent;
	@ViewChild('generalInformation') generalInformation: GeneralInformationComponent;

	public createTimeDateFromString = FormUtil.createTimeDateFromString;
	public validationFunctionError = FormUtil.validationFunctionError;
	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;

	public workingHoursData: WorkingHoursDto[] = [];
	public contactInformationForm: FormGroup = new FormGroup([]);
	public initialContactInformationForm: FormGroup;
	public generalInformationForm: FormGroup = new FormGroup([]);
	public initialGeneralInformationForm: FormGroup;

	public isToggleActive = false;
	public hasDuplicateError = false;
	public isSaving = false;

	public characterLimitMessageService = inject(CharacterLimitMessageService);
	public data = inject(MAT_DIALOG_DATA);
	private dialogService = inject(DialogService);
	private supplierProfileService = inject(SupplierProfileService);
	private municipalitySupplierService = inject(MunicipalitySupplierService);
	private dialogRef = inject(MatDialogRef<SupplierReviewPopupComponent>);
	private workingHoursService = inject(WorkingHoursService);
	private cdr = inject(ChangeDetectorRef);
	private pdokService = inject(PdokService);

	public get areFormValuesChanged(): boolean {
		const hasContactInfoChanged =
			this.initialContactInformationForm &&
			JSON.stringify(this.initialContactInformationForm) !== JSON.stringify(this.contactInformationForm.value);

		const hasGeneralInfoChanged =
			this.initialGeneralInformationForm &&
			JSON.stringify(this.initialGeneralInformationForm) !== JSON.stringify(this.generalInformationForm.value);

		const hasWorkingHoursChanged = this.workingHoursEdit?.mapWorkingHours()?.some((wh) => wh.isChecked) ?? false;

		return !this.isReadOnly && (hasContactInfoChanged || hasGeneralInfoChanged || hasWorkingHoursChanged);
	}

	public get isFormValid(): boolean {
		return (
			this.contactInformationForm.valid &&
			this.generalInformationForm.valid &&
			this.workingHoursEdit?.areRequiredDaysValid() &&
			!this.isSaving
		);
	}

	public get supplierProfileServiceInformation(): SupplierProfile {
		const profileValue = this.supplierProfileService.supplierProfileInformation;
		return profileValue ? profileValue : new SupplierProfile();
	}

	public get supplierId(): string | undefined {
		return this.supplierProfileService.supplierProfileInformation?.supplierId;
	}

	public ngOnInit(): void {
		this.dialogRef.backdropClick().subscribe(() => {
			this.close();
		});

		this.getWorkingHours();
	}

	public ngAfterViewChecked(): void {
		this.cdr.detectChanges();
	}

	public discardChanges(): void {
		this.dialogRef.close();
	}

	public close(value?: string): void {
		if (this.areFormValuesChanged) {
			this.openWarningModal();
			return;
		}

		this.dialogRef.close(value);
	}

	public handleInformationFormEvent(data: FormGroup, isContactInformationForm: boolean): void {
		const formType = isContactInformationForm ? 'contactInformationForm' : 'generalInformationForm';
		const initialFormType = isContactInformationForm
			? 'initialContactInformationForm'
			: 'initialGeneralInformationForm';

		if (!this[initialFormType] && JSON.stringify(data.value) !== JSON.stringify({})) {
			this[initialFormType] = structuredClone(data.value);
		}

		this[formType] = data;
	}

	public openWarningModal(): void {
		const data = new WarningDialogData();

		this.dialogService
			.message(CustomDialogComponent, {
				...CustomDialogConfigUtil.createMessageModal(
					new ModalData(
						'general.warning',
						'',
						'superadmin.leavingWarning',
						'general.button.stay',
						'general.button.cancel',
						false,
						'warning',
						'theme',
						'',
						data,
					),
				),
				width: '400px',
			})
			?.afterClosed()
			.subscribe((result) => {
				if (result) {
					this.dialogRef.close(false);
				}
			});
	}

	private getWorkingHours(): void {
		if (!this.data?.supplierId) {
			return;
		}

		this.workingHoursService.getWorkingHours(this.data?.supplierId).subscribe((data) => {
			if (!data.length) {
				return;
			}

			data.forEach((savedDay) => {
				this.workingHoursData.push(
					new WorkingHoursDto(
						savedDay.day,
						savedDay.openTime,
						savedDay.closeTime,
						savedDay.isChecked,
						savedDay.id,
					),
				);
			});

			if (this.workingHoursEdit) {
				this.workingHoursEdit.populateForm(this.workingHoursData);
			}
		});
	}

	public saveSupplierPatch(): void {
		if (this.isSaving) return;
		this.isSaving = true;

		const {
			legalForm,
			group,
			category,
			subcategory,
			companyName,
			kvkNumber,
			adminEmail,
			...generalInformationRest
		}: GeneralInformation = this.generalInformationForm.value;

		const profile: SupplierProfilePatchDto = {
			...this.contactInformationForm.value,
			...generalInformationRest,
			legalForm: parseInt(legalForm, 10),
			group: parseInt(group, 10),
			category: parseInt(category, 10),
			subcategory: parseInt(subcategory, 10),
			supplierId: this.supplierId,
			cashierEmails: Array.from(this.generalInformation.cashierEmailsList),
		};

		this.pdokService
			.getCoordinateFromAddress(profile.branchLocation, profile.branchZip)
			.pipe(
				switchMap((data) => {
					if (data?.response?.numFound) {
						profile.latlon = PdokUtil.getCoordinatesFromPdok(data);
					}

					const supplierRequestPatch = new SupplierRequestPatchDto({
						supplierId: this.supplierId,
						companyName,
						kvkNumber,
						adminEmail,
						workingHours: this.workingHoursEdit?.mapWorkingHours() ?? [],
						profile,
					});

					return this.municipalitySupplierService.patchSupplierProfile(supplierRequestPatch).pipe(
						catchError((error) => {
							if (error?.error === SilentErrorCode.cashierEmailDuplicated) {
								this.hasDuplicateError = true;
							}

							throw error;
						}),
					);
				}),
				finalize(() => (this.isSaving = false)),
			)
			.subscribe(() => {
				this.dialogRef.close(SupplierStatus.APPROVED);
			});
	}
}
