import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {
	CharacterLimitMessageService,
	FormUtil,
	ModalData,
	TEXT_AREA_MAX_LENGTH,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';

import { RejectOfferDto } from '../../_models/reject-offer-dto.model';
import { PendingOffersService } from '../../pending-offers.service';

@Component({
	selector: 'frontend-offer-approval-popup',
	templateUrl: './offer-approval-popup.component.html',
	styleUrls: ['./offer-approval-popup.component.scss'],
	standalone: false,
})
export class OfferApprovalPopupComponent implements OnInit {
	public rejectionForm: FormGroup;
	public isRejecting = false;
	public characterLimitMessage = '';
	public isOverCharacterLimit = false;
	public maxLength = TEXT_AREA_MAX_LENGTH;

	public validationFunctionError = FormUtil.validationFunctionError;
	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;

	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public readonly characterLimitMessageService: CharacterLimitMessageService,
		private pendingOfferService: PendingOffersService,
		private readonly translateService: TranslateService,
		private readonly toastrService: ToastrService,
		private readonly dialogRef: MatDialogRef<OfferApprovalPopupComponent>,
		private readonly formBuilder: FormBuilder,
		private readonly dialogService: DialogService,
	) {}

	public ngOnInit(): void {
		this.initRejectionForm();

		this.dialogRef.backdropClick().subscribe(() => {
			this.close();
		});
	}

	public close(): void {
		if (this.rejectionForm.valid) {
			this.openWarningModal();
			return;
		}

		this.dialogRef.close();
	}

	public setIsRejecting(value: boolean): void {
		this.isRejecting = value;
		this.dialogRef.updateSize(value ? '790px' : '80%');
	}

	public rejectOffer(): void {
		const rejectOfferDto = this.createRejectOfferDto();

		this.pendingOfferService.rejectOffer(rejectOfferDto).subscribe(() => {
			this.showSuccessToaster('rejectSupplier.success');
			this.dialogRef.close(true);
		});
	}

	public approveOffer(): void {
		this.pendingOfferService.approveOffer(this.data.offer.id).subscribe(() => {
			this.showSuccessToaster('offer.approve.successfulApproval');
			this.dialogRef.close(true);
		});
	}

	public openWarningModal(): void {
		const data = new WarningDialogData();

		this.dialogService
			.message(CustomDialogComponent, {
				...CustomDialogConfigUtil.createMessageModal(
					new ModalData(
						'general.warning',
						'',
						'rejectOffer.leavingWarning',
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

	private createRejectOfferDto(): RejectOfferDto {
		return new RejectOfferDto(this.data.offer.id, this.rejectionForm.get('rejectionReason')?.value);
	}

	private showSuccessToaster(messageKey: string): void {
		this.toastrService.success(this.translateService.instant(messageKey), '', { toastBackground: 'toast-light' });
	}

	private initRejectionForm(): void {
		this.characterLimitMessageService.messageCount = TEXT_AREA_MAX_LENGTH;

		this.rejectionForm = this.formBuilder.group({
			rejectionReason: ['', [Validators.required, Validators.maxLength(TEXT_AREA_MAX_LENGTH)]],
		});
	}
}
