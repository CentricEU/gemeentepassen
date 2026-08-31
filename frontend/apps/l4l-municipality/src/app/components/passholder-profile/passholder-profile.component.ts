import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BenefitService, CommonL4LModule, EligibleBenefitDto, PassholderViewDto } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'frontend-passholder-profile',
	imports: [CommonModule, CommonL4LModule, TranslateModule, WindmillModule],
	templateUrl: './passholder-profile.component.html',
	styleUrl: './passholder-profile.component.scss',
})
export class PassholderProfileComponent implements OnInit {
	@Input()
	public passholder: PassholderViewDto;
	public passholderProfileForm: FormGroup;
	public benefits: EligibleBenefitDto[];
	public isReadonly = true;
	public formFields = [
		{ label: 'general.fullName', controlName: 'fullName' },
		{ label: 'general.bsn', controlName: 'bsn' },
		{ label: 'general.address', controlName: 'address' },
		{ label: 'general.residence', controlName: 'residence' },
		{ label: 'general.passNumber', controlName: 'passNumber' },
		{ label: 'general.expirationDate', controlName: 'expirationDate' },
	];

	private readonly formBuilder = inject(FormBuilder);
	private readonly benefitService = inject(BenefitService);

	public get citizenGroupName(): string {
		return this.passholder.citizenGroupName || '';
	}

	public get isRegisteredLabel(): string {
		return this.passholder.isRegistered ? 'general.yes' : 'general.no';
	}

	public get registrationClass(): string {
		return this.passholder.isRegistered ? 'registered' : 'not-registered';
	}

	public get isExpiredPassholder(): boolean {
		return new Date(this.passholder.expiringDate) < new Date();
	}

	public ngOnInit(): void {
		this.initForm();
		this.loadBenefits();
	}

	private initForm(): void {
		this.passholderProfileForm = this.formBuilder.group({
			fullName: [this.passholder.name, []],
			bsn: [this.passholder.bsn, []],
			address: [this.passholder.address, []],
			residence: [this.passholder.residenceCity, []],
			passNumber: [this.passholder.passNumber, []],
			expirationDate: [
				new Date(this.passholder.expiringDate).toLocaleDateString('en-GB', {
					day: '2-digit',
					month: '2-digit',
					year: 'numeric',
				}),
				[],
			],
		});
	}

	private loadBenefits(): void {
		this.benefitService.getAllBenefitsByPassholderId(this.passholder.id).subscribe((benefits) => {
			this.benefits = benefits;
		});
	}
}
