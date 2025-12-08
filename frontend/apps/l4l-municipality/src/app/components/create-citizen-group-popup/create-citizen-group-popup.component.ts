import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import {
	CitizenGroupAge,
	CitizenGroupAgeMapping,
	CitizenGroupDto,
	CitizenGroupsService,
	CommonL4LModule,
	CommonUtil,
	EligibilityCriteria,
	FormUtil,
	ModalData,
	REQUIRED_DOCUMENTS_LIST,
	RequiredDocuments,
	TenantService,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil, WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';

@Component({
	selector: 'frontend-create-citizen-popup-popup',
	templateUrl: './create-citizen-group-popup.component.html',
	styleUrls: ['./create-citizen-group-popup.component.scss'],
	standalone: true,
	imports: [CommonModule, CommonL4LModule, TranslateModule, WindmillModule],
})
export class CreateCitizenGroupPopupComponent implements OnInit {
	private readonly dialogService = inject(DialogService);
	private readonly formBuilder = inject(FormBuilder);
	private readonly dialogRef = inject(MatDialogRef<CreateCitizenGroupPopupComponent>);
	private readonly tenantService = inject(TenantService);
	private readonly translateService = inject(TranslateService);
	private readonly citizenGroupService = inject(CitizenGroupsService);

	private calculatedMaxIncome: number;

	public createCitizenGroupForm: FormGroup;
	public actionsList = ['general.no', 'general.yes'];

	public ageGroupSource = Array.from(CitizenGroupAgeMapping().entries()).map((entry) => ({
		id: entry[0],
		value: entry[0] !== CitizenGroupAge.UNDER_18 ? entry[1] : this.translateService.instant('citizenGroup.under18'),
	}));

	public eligibilityCriterias: {
		formControl: string;
		translateKey: string;
		value: string;
		id: string;
		dataTestId: string;
	}[] = [
		{
			formControl: 'formControlHasDigiD',
			translateKey: 'hasDigiD',
			value: EligibilityCriteria.HAS_EXISTING_DIGID,
			id: 'id-has-digid-checkbox',
			dataTestId: 'data-testid-has-digid-checkbox',
		},
		{
			formControl: 'formControlIs18OrOlder',
			translateKey: 'isAdult',
			value: EligibilityCriteria.IS_AGE_18_OR_OLDER,
			id: 'id-18-or-older-checkbox',
			dataTestId: 'data-testid-18-or-older-checkbox',
		},
		{
			formControl: 'formControlLivesInCity',
			translateKey: 'livesInCity',
			value: EligibilityCriteria.RESIDES_IN_CITY,
			id: 'id-lives-in-city-checkbox',
			dataTestId: 'data-testid-lives-in-city-checkbox',
		},
		{
			formControl: 'formControlNotStudent',
			translateKey: 'notStudent',
			value: EligibilityCriteria.IS_NOT_A_STUDENT,
			id: 'id-not-student-checkbox',
			dataTestId: 'data-testid-not-student-checkbox',
		},
	];
	public requiredDocuments = REQUIRED_DOCUMENTS_LIST;

	public get language(): string {
		CitizenGroupAgeMapping().get(CitizenGroupAge.UNDER_18);

		return this.translateService.currentLang || 'nl-NL';
	}

	public get wage(): string {
		return CommonUtil.formatCurrency(this.tenantService.tenant?.wage || 0, this.language);
	}

	public get saveButtonDisabled(): boolean {
		return (
			this.createCitizenGroupForm?.invalid ||
			!this.eligibilityCriterias.some((ec) => this.createCitizenGroupForm.get(ec.formControl)?.value) ||
			!this.requiredDocuments.some((rd) => this.createCitizenGroupForm.get(rd.formControl)?.value)
		);
	}

	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public hasControlRequiredErrorAndTouched = FormUtil.hasControlRequiredErrorAndTouched;
	public hasControlMinMaxErrors = FormUtil.hasControlMinMaxErrors;
	public validationFunctionError = FormUtil.validationFunctionError;
	public emailValidator = FormUtil.validateEmail(false);
	public getEmailErrorMessage = FormUtil.getEmailErrorMessage;

	public ngOnInit(): void {
		this.initForm();

		this.dialogRef.keydownEvents().subscribe((event) => {
			if (event.key === 'Escape') {
				this.close();
			}
		});

		this.dialogRef.backdropClick().subscribe(() => {
			this.close();
		});

		this.subscribeToThresholdChanges();
	}

	public close(): void {
		if (!this.createCitizenGroupForm.dirty) {
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
						'citizenGroup.leavingWarning',
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

	public createCitizenGroup(): void {
		const createCitizenGroupDto = this.formValuesToCreateCitizenDto();

		this.citizenGroupService.saveCitizenGroup(createCitizenGroupDto).subscribe(() => {
			this.dialogRef.close(true);
		});
	}

	private formValuesToCreateCitizenDto(): CitizenGroupDto {
		const { groupName, ageGroup, threshold, dependentChildren } = this.createCitizenGroupForm.controls;
		return new CitizenGroupDto(
			groupName?.value,
			Array.isArray(ageGroup?.value) ? ageGroup?.value.map((item) => item.id) : [],
			dependentChildren?.value === this.actionsList[1],
			parseFloat(Number(threshold?.value).toFixed(2)),
			this.calculatedMaxIncome ? parseFloat(this.calculatedMaxIncome.toFixed(2)) : 0,
			this.eligibilityCriterias
				.filter((ec) => this.createCitizenGroupForm.get(ec.formControl)?.value)
				.map((ec) => ec.value as EligibilityCriteria),
			this.requiredDocuments
				.filter((rd) => this.createCitizenGroupForm.get(rd.formControl)?.value)
				.map((rd) => rd.value as RequiredDocuments),
		);
	}

	private initForm(): void {
		this.createCitizenGroupForm = this.formBuilder.group({
			groupName: ['', [Validators.required]],
			ageGroup: ['', [Validators.required, Validators.maxLength(64)]],
			maxIncome: [{ value: '', disabled: true }, [Validators.required]],
			threshold: ['', [Validators.required, Validators.max(200), Validators.min(1)]],
			dependentChildren: [false, [Validators.required]],
			formControlHasDigiD: [false],
			formControlIs18OrOlder: [false],
			formControlLivesInCity: [false],
			formControlNotStudent: [false],
			formControlProofOfIdentity: [false],
			formControlIncomeProof: [false],
			formControlAssets: [false],
			formControlDebtsOrAlimony: [false],
		});
	}

	private subscribeToThresholdChanges(): void {
		this.createCitizenGroupForm.valueChanges.subscribe((data: { threshold: number }) => {
			if (!this.tenantService.tenant) {
				return;
			}
			if (!data.threshold || data.threshold < 0 || !this.tenantService.tenant.wage) {
				this.createCitizenGroupForm.patchValue({ maxIncome: '' }, { emitEvent: false });
				return;
			}
			this.calculatedMaxIncome = (data.threshold / 100) * this.tenantService.tenant.wage;
			const calculatedMaxIncomeFormatted = `€${this.calculatedMaxIncome.toLocaleString(this.language, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
			this.createCitizenGroupForm.patchValue({ maxIncome: calculatedMaxIncomeFormatted }, { emitEvent: false });
		});
	}
}
