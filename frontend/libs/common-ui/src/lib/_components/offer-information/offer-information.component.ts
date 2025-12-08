import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { OfferInformationDto } from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

const DATE_FORMAT = 'MM/DD/YYYY';
const MY_FORMATS = {
	parse: {
		dateInput: DATE_FORMAT,
	},
	display: {
		dateInput: DATE_FORMAT,
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};

@Component({
	selector: 'frontend-offer-information',
	templateUrl: './offer-information.component.html',
	styleUrls: ['./offer-information.component.scss'],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE],
		},
		{ provide: MAT_DATE_LOCALE, useValue: 'en-US' },
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
	standalone: false,
})
export class OfferInformationComponent implements OnInit {
	@Input() offer: OfferInformationDto;
	public offerInformation: FormGroup;

	constructor(
		private translateService: TranslateService,
		private formBuilder: FormBuilder,
	) {}

	public ngOnInit(): void {
		this.initForm(this.offer);
	}

	private getCitizenOfferType(): string {
		return this.translateService.instant('offer.citizenWithPass');
	}

	private getAcceptedBenefit(offer: OfferInformationDto): string {
		if (!offer.benefit) {
			return '';
		}

		return offer.benefit.name;
	}

	private initForm(data: OfferInformationDto): void {
		this.offerInformation = this.formBuilder.group({
			citizenOfferType: [this.getCitizenOfferType()],
			title: [data.title, [Validators.required]],
			offerTypeId: [this.translateService.instant(data.offerType), [Validators.required]],
			acceptedBenefit: [this.getAcceptedBenefit(data), [Validators.required]],
			description: [data.description, [Validators.required]],
			startDate: [moment(data.startDate), [Validators.required]],
			expirationDate: [moment(data.expirationDate), [Validators.required]],
		});
	}
}
