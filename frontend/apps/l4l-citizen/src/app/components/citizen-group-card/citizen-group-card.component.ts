import { CommonModule } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { CitizenGroupAge, CitizenGroupAgeMapping, CommonUtil, KeyValuePair } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { TooltipOnEllipsisDirective } from '../../shared/directives/tooltip-on-elipsis/tooltip-on-elipsis.directive';
import { CitizenGroupCardData } from '../../shared/models/citizen-group-card.model';

@Component({
	selector: 'app-citizen-group-card',
	imports: [TranslateModule, CommonModule, WindmillModule, TooltipOnEllipsisDirective],
	templateUrl: './citizen-group-card.component.html',
	styleUrl: './citizen-group-card.component.scss',
})
export class CitizenGroupCardComponent {
	@Input({ required: true }) groupCardData: CitizenGroupCardData;

	private readonly translateService = inject(TranslateService);

	public get formattedIncome(): string {
		const language = this.translateService.currentLang || 'nl-NL';
		return CommonUtil.formatCurrency(this.groupCardData.maxIncome, language);
	}

	public assignCitizenGroup(): void {
		if (this.groupCardData.isReadonly) {
			return;
		}

		this.groupCardData.selected = !this.groupCardData.selected;
	}

	public get categoryDetails(): KeyValuePair[] {
		return [
			{
				key: 'citizenGroup.ageGroup',
				value: this.formatAgeGroups(this.groupCardData.ageGroup),
			},
			{
				key: 'citizenGroup.isDependentChildrenIncluded',
				value: this.formatDependentChildren(this.groupCardData.dependentChildren),
			},
			{
				key: 'applyForPass.groupCitizenAssignmentFromDigiD.maxIncome',
				value: this.formattedIncome,
			},
		];
	}

	private formatAgeGroups(ages?: string[]): string {
		return (ages ?? [])
			.map((age) => CitizenGroupAgeMapping().get(age as CitizenGroupAge))
			.filter(Boolean)
			.join(', ');
	}

	private formatDependentChildren(condition: boolean): string {
		return this.translateService.instant(condition ? 'general.yes' : 'general.no');
	}
}
