import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
	CharacterLimitMessageService,
	FormUtil,
	ModalData,
	RejectionReason,
	SupplierProfileService,
	SupplierRejectionService,
	SupplierStatus,
	TEXT_AREA_MAX_LENGTH,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';

import { RejectSupplierDto } from '../../_models/reject-supplier-dto.model';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';

@Component({
	selector: 'frontend-supplier-review-popup',
	templateUrl: './supplier-review-popup.component.html',
	styleUrls: ['./supplier-review-popup.component.scss'],
	standalone: false,
})
export class SupplierReviewPopupComponent implements OnInit {
	public rejectSupplierForm: FormGroup;
	public isRejecting = false;

	public reasonDropdownSource: string[] = this.supplierRejectionService.rejectionReasonValues.map((reason) =>
		this.translateService.instant(reason.key),
	);

	public reasonUpdatedSource: string[] = [];
	public characterLimitMessage = '';
	public isOverCharacterLimit = false;
	public maxLength = TEXT_AREA_MAX_LENGTH;

	public validationFunctionError = FormUtil.validationFunctionError;
	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;

	private mapRejectionStringToEnum: Record<string, RejectionReason> = Object.fromEntries(
		this.supplierRejectionService.rejectionReasonValues.map((reason) => [
			this.translateService.instant(reason.key),
			reason.value,
		]),
	);

	constructor(
		public readonly characterLimitMessageService: CharacterLimitMessageService,
		private readonly dialogService: DialogService,
		private readonly supplierRejectionService: SupplierRejectionService,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private supplierService: MunicipalitySupplierService,
		private supplierProfileService: SupplierProfileService,
		private readonly dialogRef: MatDialogRef<SupplierReviewPopupComponent>,
		private formBuilder: FormBuilder,
		private translateService: TranslateService,
	) {}

	public ngOnInit(): void {
		this.reasonUpdatedSource = this.reasonDropdownSource;
		this.initRejectSupplierForm();

		this.dialogRef.backdropClick().subscribe(() => {
			this.close();
		});
	}

	public close(value?: string): void {
		if (this.rejectSupplierForm.valid || this.rejectSupplierForm.get('rejectionComments')?.value != '') {
			this.openWarningModal();
			return;
		}

		this.dialogRef.close(value);
	}

	public rejectSupplier(): void {
		if (!this.supplierId) {
			return;
		}

		const rejectSupplierDto = this.createRejectSupplierDto(this.supplierId);

		this.supplierRejectionService.rejectSupplier(rejectSupplierDto).subscribe(() => {
			this.dialogRef.close(SupplierStatus.REJECTED);
		});
	}

	public setIsRejecting(value: boolean): void {
		this.isRejecting = value;
		this.dialogRef.updateSize(value ? '790px' : '80%');
	}

	public approveSupplier(): void {
		if (!this.supplierId) {
			return;
		}

		this.supplierService.approveSupplier(this.supplierId).subscribe(() => {
			this.dialogRef.close(SupplierStatus.APPROVED);
		});
	}

	public onSearchValueChanged(event: string | null): void {
		this.reasonUpdatedSource =
			event === null
				? this.reasonDropdownSource
				: this.reasonDropdownSource.filter((item) => item.toLowerCase().includes(event.trim().toLowerCase()));
	}

	public openWarningModal(): void {
		const data = new WarningDialogData();

		this.dialogService
			.message(CustomDialogComponent, {
				...CustomDialogConfigUtil.createMessageModal(
					new ModalData(
						'general.warning',
						'',
						'rejectSupplier.leavingWarning',
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

	private get supplierId() {
		return this.supplierProfileService.supplierProfileInformation?.supplierId;
	}

	private createRejectSupplierDto(supplierId: string): RejectSupplierDto {
		return new RejectSupplierDto(
			this.mapRejectionStringToEnum[this.rejectSupplierForm.get('rejectionReason')?.value],
			supplierId,
			this.rejectSupplierForm.get('rejectionComments')?.value,
		);
	}

	private initRejectSupplierForm(): void {
		this.characterLimitMessageService.messageCount = TEXT_AREA_MAX_LENGTH;

		this.rejectSupplierForm = this.formBuilder.group({
			rejectionReason: ['', [Validators.required]],
			rejectionComments: ['', [Validators.maxLength(TEXT_AREA_MAX_LENGTH)]],
		});
	}
}
