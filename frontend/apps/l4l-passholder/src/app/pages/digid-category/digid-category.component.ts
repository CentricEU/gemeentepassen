import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CitizenGroupAge, CitizenGroupsService, commonRoutingConstants } from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';

import { CitizenGroupCardComponent } from '../../components/citizen-group-card/citizen-group-card.component';

@Component({
	selector: 'app-digid-category',
	imports: [CitizenGroupCardComponent, TranslateModule, WindmillModule],
	templateUrl: './digid-category.component.html',
	styleUrl: './digid-category.component.scss',
})
export class DigiDCategoryComponent {
	// Mock data until we receive data from DigiD
	public readonly ageGroup: CitizenGroupAge[] = Object.values(CitizenGroupAge) as CitizenGroupAge[];
	
	private readonly router = inject(Router);
	private readonly citizenGroupsService = inject(CitizenGroupsService);

	public changeCategory(): void {
		this.router.navigate([commonRoutingConstants.citizenGroupAssignment]);
	}

	public confirmAssignedCategory(): void {
		this.citizenGroupsService.startFlowPageValue = commonRoutingConstants.digidCategory;
		this.router.navigate([commonRoutingConstants.applyForPassSetup]);
	}
}
