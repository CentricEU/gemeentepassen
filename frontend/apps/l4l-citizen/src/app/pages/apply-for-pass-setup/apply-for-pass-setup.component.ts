import { CdkStepper, StepperSelectionEvent } from '@angular/cdk/stepper';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CommonModule } from '@angular/common';
import {
	AfterViewInit,
	ChangeDetectorRef,
	Component,
	inject,
	NgZone,
	OnDestroy,
	OnInit,
	ViewChild,
} from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogConfig } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
	CitizenGroupsService,
	commonRoutingConstants,
	FormUtil,
	ModalData,
	TEXT_AREA_MAX_LENGTH,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { CentricButtonModule } from '@windmill/ng-windmill/button';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ResponsiveService } from '@windmill/ng-windmill/shared';
import {
	CentricHorizontalStepperComponent,
	CentricStepComponent,
	CentricStepLabelDirective,
	CentricStepperModule,
	CentricVerticalStepperComponent,
} from '@windmill/ng-windmill/stepper';

import { AdditionalInformationComponent } from '../../components/additional-information/additional-information.component';
import { CheckAndSendComponent } from '../../components/check-and-send/check-and-send.component';
import { CitizenDocumentsNeededComponent } from '../../components/citizen-documents-needed/citizen-documents-needed.component';
import { ConfirmIdentityComponent } from '../../components/confirm-identity/confirm-identity.component';
import { EligibleBenefitsComponent } from '../../components/eligible-benefits/eligible-benefits.component';
import { NoDataComponent } from '../../components/no-data/no-data.component';
import { PassesService } from '../../services/passes/passes.service';
import { UserClaimsService } from '../../services/user-claims/user-claims.service';
import { StepType } from '../../shared/enums/step-type.enum';
import { CitizenIdentityDto } from '../../shared/models/citizen-identity-dto.model';
import { PassDto } from '../../shared/models/pass-dto.model';
import { Step } from '../../shared/models/step.model';

@Component({
	selector: 'app-apply-for-pass-setup',
	imports: [
		CommonModule,
		CdkStepperModule,
		CentricButtonModule,
		WindmillModule,
		CentricStepperModule,
		CentricHorizontalStepperComponent,
		CentricVerticalStepperComponent,
		CentricStepComponent,
		CentricStepLabelDirective,
		TranslateModule,
		ConfirmIdentityComponent,
		EligibleBenefitsComponent,
		CitizenDocumentsNeededComponent,
		AdditionalInformationComponent,
		CheckAndSendComponent,
		NoDataComponent,
	],
	providers: [{ provide: CdkStepper, useClass: CdkStepper }],
	templateUrl: './apply-for-pass-setup.component.html',
	styleUrl: './apply-for-pass-setup.component.scss',
})
export class ApplyForPassSetupComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('confirmIdentity') confirmIdentity: ConfirmIdentityComponent;
	@ViewChild('fileUpload') fileUpload: CitizenDocumentsNeededComponent;
	@ViewChild('horizontalStepper') horizontalStepper: CentricHorizontalStepperComponent;
	@ViewChild('verticalStepper') verticalStepper: CentricVerticalStepperComponent;
	@ViewChild('additionalInformation') additionalInformation: AdditionalInformationComponent;
	@ViewChild('checkAndSend') checkAndSend: CheckAndSendComponent;

	public emailValidator = FormUtil.validateEmail(false);

	public confirmIdentityFormGroup!: FormGroup;
	public uploadDocumentsFormGroup!: FormGroup;
	public additionalInformationFormGroup!: FormGroup;
	public checkAndSendFormGroup!: FormGroup;

	public resizeTableObserver!: ResizeObserver;
	public maxLines = 1;
	public breakpointName = '';
	public selectedIndex = 0;
	public isChecked = true;
	public isSuccessfullySubmitted = false;
	public steps: Step[];
	public bsn: string | null = null;
	public citizenIdentityData: CitizenIdentityDto;
	public filesAdded: File[] = [];
	public additionalMessage = '';

	private readonly citizenGroupsService = inject(CitizenGroupsService);
	private readonly dialogService = inject(DialogService);
	private readonly router = inject(Router);

	private readonly responsiveService = inject(ResponsiveService);
	private readonly ngZone = inject(NgZone);
	private readonly cdr = inject(ChangeDetectorRef);
	private readonly userClaimsService = inject(UserClaimsService);
	private readonly passesService = inject(PassesService);
	private stepCompletionCheckers: (() => boolean)[];

	public get StepTypeInstance() {
		return StepType;
	}

	public get translateParams(): { [key: string]: string } {
		return {
			email: this.citizenIdentityData.email ?? '',
			phoneNumber: this.citizenIdentityData.telephone ?? '',
		};
	}

	public inputFields = [
		{
			labelKey: 'genericFields.lastName.title',
			controlName: 'lastName',
			id: 'last-name-id',
			name: 'lastName',
		},
		{
			labelKey: 'genericFields.firstName.title',
			controlName: 'firstName',
			id: 'first-name-id',
			name: 'firstName',
		},
		{
			labelKey: 'confirmIdentity.birthdate',
			controlName: 'birthdate',
			id: 'birthdate-id',
			name: 'birthdate',
		},
		{
			labelKey: 'general.bsn',
			controlName: 'bsn',
			id: 'bsn-id',
			name: 'bsn',
		},
		{
			labelKey: 'confirmIdentity.telephone',
			controlName: 'telephone',
			id: 'telephone-id',
			name: 'telephone',
		},
		{
			labelKey: 'general.email',
			controlName: 'email',
			id: 'email-id',
			name: 'email',
		},
	];

	public ngOnInit(): void {
		this.initializeFormGroups();
		this.initializeStepCompletionCheckers();
		this.initializeSteps();
	}

	public ngAfterViewInit(): void {
		this.updateLayoutBreakpoint();
		this.setSocialDomainData();
	}

	public ngOnDestroy(): void {
		this.resizeTableObserver?.disconnect();
	}

	public cancel(): void {
		this.openWarningModal();
	}

	public isStepCompletedByIndex(index: number): boolean {
		return this.stepCompletionCheckers[index]?.() ?? false;
	}

	public isStepCompleted(formControl: AbstractControl): boolean {
		return formControl.value !== '' && formControl.value !== null && formControl.value !== 'undefined';
	}

	public isLastStepCompleted(formControl: AbstractControl): boolean {
		return Boolean(formControl.value);
	}

	public onSelectedStep(event: StepperSelectionEvent): void {
		this.selectedIndex = event.selectedIndex;
		this.scrollToTop();
	}

	public onFilesUploadedChanged(files: File[]): void {
		this.filesAdded = files;
	}

	public onAdditionalMessageChanged(value: string): void {
		this.additionalMessage = value;
	}

	public onEmailValueChanged(value: string | number): void {
		this.citizenIdentityData.email = String(value);
		this.checkAndSend.updateFormWithCitizenData(this.citizenIdentityData);
	}

	public handleNextAction(stepType: StepType): void {
		if (stepType === StepType.CheckAndSend) {
			this.passesService.savePass(this.getPassDtoFromInputs(), this.filesAdded).subscribe(() => {
				this.isSuccessfullySubmitted = true;
			});
			return;
		}

		if (this.breakpointName === 'small' && this.verticalStepper) {
			this.verticalStepper.next();
			return;
		}
		this.horizontalStepper.next();
	}

	public goToPreviousStep(): void {
		if (this.breakpointName === 'small' && this.verticalStepper) {
			this.verticalStepper.previous();
			return;
		}
		this.horizontalStepper.previous();
	}

	public onConfirmIdentityFormGroupChange(updatedFormGroup: FormGroup): void {
		this.confirmIdentityFormGroup = updatedFormGroup;
	}

	public getLastButtonLabel(stepType: StepType): string {
		return stepType === StepType.CheckAndSend ? 'general.button.send' : 'general.button.stepperNext';
	}

	private initializeFormGroups(): void {
		this.confirmIdentityFormGroup = new FormGroup(this.createCommonFormControls());

		this.uploadDocumentsFormGroup = new FormGroup({
			uploadDocumentsFormControl: new FormControl('', Validators.required),
		});

		this.additionalInformationFormGroup = new FormGroup({
			message: new FormControl('', Validators.maxLength(TEXT_AREA_MAX_LENGTH)),
		});

		this.checkAndSendFormGroup = new FormGroup({
			...this.createCommonFormControls(),
			additionalMessage: new FormControl('', Validators.maxLength(TEXT_AREA_MAX_LENGTH)),
		});
	}

	private createCommonFormControls(): { [key: string]: FormControl } {
		return {
			lastName: new FormControl('', Validators.required),
			firstName: new FormControl('', Validators.required),
			bsn: new FormControl(this.userClaimsService.getBsn(), Validators.required),
			birthdate: new FormControl('', Validators.required),
			telephone: new FormControl('', Validators.required),
			email: new FormControl('', [Validators.required, this.emailValidator]),
		};
	}

	private updateLayoutBreakpoint(): void {
		const stepperContainer = document.querySelector('.centric-stepper') as HTMLElement | null;
		if (!stepperContainer) {
			return;
		}

		this.resizeTableObserver = new ResizeObserver((entries: ResizeObserverEntry[]) => {
			this.ngZone.run(() => {
				for (const entry of entries) {
					if (this.responsiveService.isSmall(entry.contentRect.width)) {
						this.breakpointName = 'small';
					} else {
						this.breakpointName = 'large';
					}
					this.cdr.markForCheck();
				}
			});
		});

		this.resizeTableObserver.observe(stepperContainer);
	}

	private openWarningModal(): void {
		const config = this.createWarningDialogConfig();
		this.dialogService
			.message(CustomDialogComponent, config)
			?.afterClosed()
			.subscribe((data) => {
				if (!data) {
					return;
				}
				this.performClose();
			});
	}

	private createWarningDialogConfig(): MatDialogConfig {
		const data = new WarningDialogData();

		const modal = new ModalData(
			'applyForPassSetup.warningTitle',
			'',
			'applyForPassSetup.warningDescription',
			'general.button.stay',
			'general.button.cancel',
			false,
			'warning',
			'theme',
			'',
			data,
		);
		return CustomDialogConfigUtil.createMessageModal(modal);
	}

	private performClose(): void {
		this.router.navigate([this.citizenGroupsService.startFlowPageValue]);
		this.citizenGroupsService.startFlowPageValue = commonRoutingConstants.digidCategory;
	}

	private initializeSteps(): void {
		this.steps = [
			{
				label: 'applyForPassSetup.stepper.confirmIdentityStepLabel',
				control: this.confirmIdentityFormGroup,
				completed: () => this.isStepCompletedByIndex(0),
				stepType: StepType.ConfirmIdentity,
				isNextEnabled: () => this.isStepCompletedByIndex(0),
			},
			{
				label: 'applyForPassSetup.stepper.uploadDocumentsStepLabel',
				control: this.uploadDocumentsFormGroup,
				completed: () => this.isStepCompletedByIndex(1),
				stepType: StepType.FilesUpload,
				isNextEnabled: () => this.isStepCompletedByIndex(1),
			},
			{
				label: 'applyForPassSetup.stepper.checkAndSendStepLabel',
				control: this.checkAndSendFormGroup,
				completed: () => this.isStepCompletedByIndex(2),
				stepType: StepType.CheckAndSend,
				isNextEnabled: () => this.isStepCompletedByIndex(2),
			},
		];
	}

	private initializeStepCompletionCheckers(): void {
		this.stepCompletionCheckers = [
			() => !!this.confirmIdentityFormGroup && this.confirmIdentityFormGroup.valid,
			() => this.fileUpload?.files?.length > 0 && this.additionalInformationFormGroup.valid,
			() => this.fileUpload?.files?.length > 0,
		];
	}

	private setSocialDomainData(): void {
		this.citizenIdentityData = this.getCitizenIdentity();
		this.citizenIdentityData.bsnNumber = this.userClaimsService.getBsn() ?? '';

		this.confirmIdentity.updateFormWithInitialData(this.citizenIdentityData);

		this.checkAndSend.updateFormWithCitizenData(this.citizenIdentityData);
	}

	private getCitizenIdentity(): CitizenIdentityDto {
		//curently mocked data, will be replaced after integration with data from signicat response
		return {
			lastName: 'Jansen',
			firstName: 'Piet',
			bsnNumber: '',
			birthDate: '01-01-1980',
			telephone: '+31612345678',
		};
	}

	private getPassDtoFromInputs(): PassDto {
		const formattedBirthdate = FormUtil.normalizeDate(this.confirmIdentityFormGroup.controls['birthdate'].value);
		return new PassDto(
			this.confirmIdentityFormGroup.get('firstName')?.value,
			this.confirmIdentityFormGroup.get('lastName')?.value,
			formattedBirthdate,
			this.confirmIdentityFormGroup.get('bsn')?.value,
			this.confirmIdentityFormGroup.get('telephone')?.value,
			this.confirmIdentityFormGroup.get('email')?.value,
			this.additionalMessage,
		);
	}

	private scrollToTop(): void {
		const container = document.querySelector('.inside-routing-container') as HTMLElement | null;
		if (container) {
			container.scrollTo({ top: 0 });
		}
	}
}
