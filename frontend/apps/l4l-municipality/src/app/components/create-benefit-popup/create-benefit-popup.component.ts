import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
	BenefitDto,
	BenefitService,
	CharacterLimitMessageService,
	CheckboxData,
	CitizenGroupsService,
	CommonL4LModule,
	CommonUtil,
	FormUtil,
	ModalData,
	TEXT_AREA_MAX_LENGTH_256,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { filter, merge } from 'rxjs';

@Component({
	selector: 'frontend-create-benefit-popup',
	templateUrl: './create-benefit-popup.component.html',
	styleUrls: ['./create-benefit-popup.component.scss'],
	standalone: true,
	imports: [CommonModule, CommonL4LModule, TranslateModule, WindmillModule],
})
export class CreateBenefitPopupComponent implements OnInit {
	private readonly dialogService = inject(DialogService);
	private readonly formBuilder = inject(FormBuilder);
	private readonly dialogRef = inject(MatDialogRef<CreateBenefitPopupComponent>);
	private readonly benefitService = inject(BenefitService);
	private readonly citizenGroupsService = inject(CitizenGroupsService);
	private readonly translateService = inject(TranslateService);
	public readonly characterLimitMessageService = inject(CharacterLimitMessageService);

	public createBenefitForm: FormGroup;
	public maxLength = TEXT_AREA_MAX_LENGTH_256;
	public expirationDateInit = FormUtil.calculateExpirationDate;
	public isEditable = true;
	public citizenGroupsData: CheckboxData[];
	public counterFacilityTypes: string;
	public hasCounter = true;

	public get isSaveDisabled(): boolean {
		if (!this.createBenefitForm) {
			return true;
		}

		const hasSelectedGroup =
			this.citizenGroupsData?.some((group) => this.createBenefitForm.get(group.formControl)?.value) ?? false;

		return this.createBenefitForm.invalid || !hasSelectedGroup;
	}

	public get ariaLabelCounter(): string {
		return this.counterFacilityTypes === '1'
			? this.translateService.instant('createBenefit.areaLabelCounterOneItemFacilityTypes')
			: this.translateService.instant('createBenefit.areaLabelCounterMultipleItemsFacilityTypes', {
					count: this.counterFacilityTypes,
				});
	}

	private readonly WHITESPACE_REGEX = /\s+/g;
	private readonly WORD_BOUNDARY_REGEX = /\b\w/g;

	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public hasControlRequiredErrorAndTouched = FormUtil.hasControlRequiredErrorAndTouched;
	public validationFunctionError = FormUtil.validationFunctionError;

	public ngOnInit(): void {
		this.initForm();
		this.loadInitialData();

		this.subscribeToDialogEvents();
	}

	public onCounterValueChange(value: string): void {
		this.counterFacilityTypes = value;
	}

	public close(): void {
		if (!this.createBenefitForm.dirty) {
			this.dialogRef.close(false);
			return;
		}

		this.openWarningModal();
	}

	public openWarningModal(): void {
		const data = new WarningDialogData();

		this.dialogService
			.message(CustomDialogComponent, {
				...CustomDialogConfigUtil.createMessageModal(
					new ModalData(
						'general.warning',
						'',
						'createBenefit.leavingWarning',
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
				ariaLabel: this.translateService.instant('general.closingWarning'),
			})
			?.afterClosed()
			.subscribe((result) => {
				if (!result) {
					return;
				}

				this.dialogRef.close(false);
			});
	}

	public onStartDateChange(): void {
		CommonUtil.enforceStartDateBeforeExpiration(this.createBenefitForm);
	}

	public displayValidityError(): boolean {
		return (
			FormUtil.isControlInvalid('startDate', this.createBenefitForm) ||
			FormUtil.isControlInvalid('expirationDate', this.createBenefitForm)
		);
	}

	public createNewBenefit(): void {
		const createBenefitDto = this.formValuesToBenefitDto();
		this.benefitService.createBenefit(createBenefitDto).subscribe(() => {
			this.dialogRef.close(true);
		});
	}

	private formValuesToBenefitDto(): BenefitDto {
		const { benefitName, benefitDescription, startDate, expirationDate, amount } = this.createBenefitForm.controls;

		return new BenefitDto(
			benefitName?.value,
			benefitDescription?.value,
			startDate.value.format('YYYY-MM-DD'),
			expirationDate.value.format('YYYY-MM-DD'),
			this.getSelectedCitizenGroupIds(),
			amount?.value,
		);
	}

	private initForm(): void {
		this.characterLimitMessageService.messageCount = TEXT_AREA_MAX_LENGTH_256;

		this.createBenefitForm = this.formBuilder.group({
			benefitName: ['', [Validators.required, Validators.maxLength(64)]],
			benefitDescription: ['', [Validators.required, Validators.maxLength(TEXT_AREA_MAX_LENGTH_256)]],
			amount: ['', [Validators.required]],
			startDate: ['', [Validators.required]],
			expirationDate: ['', [Validators.required]],
		});

		if (this.citizenGroupsData) {
			this.citizenGroupsData.forEach((citizenGroup: { formControl: string }) => {
				this.createBenefitForm.addControl(citizenGroup.formControl, this.formBuilder.control(false));
			});
		}
	}

	private loadInitialData(): void {
		this.citizenGroupsService.getCitizenGroups().subscribe((data) => {
			this.citizenGroupsData = data.map((citizenGroup) => ({
				id: citizenGroup.id,
				label: citizenGroup.groupName.replace(this.WORD_BOUNDARY_REGEX, (char) => char.toUpperCase()),
				formControl: `formControlCitizenGroup-${citizenGroup.groupName.replace(this.WHITESPACE_REGEX, '-')}`,
				value: citizenGroup.groupName.replace(this.WHITESPACE_REGEX, '-'),
				checked: false,
				dataTestId: `citizenGroup-${citizenGroup.groupName.replace(this.WHITESPACE_REGEX, '-')}`,
			}));

			this.citizenGroupsData.forEach((citizenGroup) => {
				this.createBenefitForm.addControl(citizenGroup.formControl, this.formBuilder.control(false));
			});
		});
	}

	private getSelectedCitizenGroupIds(): string[] {
		return this.citizenGroupsData
			? this.citizenGroupsData
					.filter((cg) => this.createBenefitForm.get(cg.formControl)?.value)
					.map((cg) => cg.id)
			: [];
	}

	private subscribeToDialogEvents(): void {
		merge(
			this.dialogRef.keydownEvents().pipe(filter((event) => event.key === 'Escape')),
			this.dialogRef.backdropClick(),
		).subscribe(() => this.close());
	}
}
