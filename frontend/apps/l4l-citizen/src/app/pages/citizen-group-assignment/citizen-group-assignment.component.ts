import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CitizenGroupsService, CitizenGroupViewDto, commonRoutingConstants } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { CitizenGroupCardComponent } from '../../components/citizen-group-card/citizen-group-card.component';
import { NoDataComponent } from '../../components/no-data/no-data.component';

@Component({
	selector: 'app-citizen-group-assignment',
	imports: [TranslateModule, WindmillModule, CitizenGroupCardComponent, NoDataComponent],
	templateUrl: './citizen-group-assignment.component.html',
	styleUrl: './citizen-group-assignment.component.scss',
})
export class CitizenGroupAssignmentComponent implements OnInit {
	private readonly citizenGroupsService = inject(CitizenGroupsService);
	private readonly router = inject(Router);

	public citizenGroupData: CitizenGroupViewDto[] = [];

	private currentCitizenGroupId: string | undefined;

	public get selectedCitizenGroupId(): string | undefined {
		return this.currentCitizenGroupId;
	}

	public get hasData(): boolean {
		return this.citizenGroupData.length > 0;
	}

	public ngOnInit(): void {
		this.initCitizenGroups();
	}

	public confirmAssignedCategory(): void {
		if (!this.currentCitizenGroupId) {
			return;
		}

		this.citizenGroupsService.assignCitizenGroupToCitizen(this.currentCitizenGroupId).subscribe(() => {
			this.citizenGroupsService.startFlowPageValue = commonRoutingConstants.citizenGroupAssignment;
			this.router.navigate([commonRoutingConstants.applyForPassSetup]);
		});
	}

	public reportNoCategoryFit(): void {
		this.router.navigate([commonRoutingConstants.noneCategoryFit]);
	}

	public goBack(): void {
		this.router.navigate([commonRoutingConstants.digidCategory]);
	}

	public selectCurrentCategory(citizenGroupId: string): void {
		this.currentCitizenGroupId = this.currentCitizenGroupId === citizenGroupId ? undefined : citizenGroupId;
	}

	private initCitizenGroups(): void {
		this.citizenGroupsService.getCitizenGroups().subscribe((data) => {
			this.citizenGroupData = data;
		});
	}
}
