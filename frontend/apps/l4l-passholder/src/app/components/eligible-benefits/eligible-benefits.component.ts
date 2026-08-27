import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
	BenefitService,
	commonRoutingConstants,
	PersistentErrorCode,
} from '@frontend/common';
import { EligibleBenefitDto } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

@Component({
	selector: 'app-eligible-benefits',
	imports: [TranslateModule, WindmillModule],
	templateUrl: './eligible-benefits.component.html',
	styleUrl: './eligible-benefits.component.scss',
})
export class EligibleBenefitsComponent implements OnInit {
	private readonly benefitsService = inject(BenefitService);
	private readonly router = inject(Router);

	private benefits: EligibleBenefitDto[];

	public get benefitsData(): EligibleBenefitDto[] {
		return this.benefits;
	}

	public ngOnInit(): void {
		this.initEligibleBenefits();
	}

	private initEligibleBenefits(): void {
		this.benefitsService.getAllBenefitsForCitizenGroup().subscribe({
			next: (benefits) => {
				this.benefits = benefits;
			},
			error: (err) => {
				if (err.error === PersistentErrorCode.citizenGroupNotFound) {
					this.router.navigate([commonRoutingConstants.digidCategory]);
				}
			},
		});
	}
}
