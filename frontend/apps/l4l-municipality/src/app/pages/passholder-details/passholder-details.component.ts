import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
	Breadcrumb,
	BreadcrumbService,
	CommonL4LModule,
	commonRoutingConstants,
	OfferTableDto,
	PassholderViewDto,
} from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { WindmillTabComponent } from '@windmill/ng-windmill/tabs';

import { PassholdersService } from '../../_services/passholders.service';
import { PassholderOffersComponent } from '../../components/passholder-offers/passholder-offers.component';
import { PassholderProfileComponent } from '../../components/passholder-profile/passholder-profile.component';
import { PendingOffersService } from '../../pending-offers.service';

@Component({
	selector: 'frontend-passholder-details',
	imports: [CommonL4LModule, TranslateModule, WindmillModule, PassholderOffersComponent, PassholderProfileComponent],
	templateUrl: './passholder-details.component.html',
	styleUrl: './passholder-details.component.scss',
})
export class PassholderDetailsComponent implements OnInit, OnDestroy {
	public passholderId?: string;
	public passholder: PassholderViewDto;
	public offersCount = signal(0);
	public tabIndex = 0;
	public offers: OfferTableDto[];
	public isPassholderExpired = false;

	private readonly passholderService = inject(PassholdersService);
	private readonly offerService = inject(PendingOffersService);

	private readonly route = inject(ActivatedRoute);
	private readonly breadcrumbService = inject(BreadcrumbService);

	public ngOnInit(): void {
		this.subscribeToRouteParam();
	}

	public ngOnDestroy(): void {
		this.breadcrumbService.removeBreadcrumbs();
	}

	public isFullSize(): boolean {
		return this.offersCount() === 0 || this.tabIndex === 0;
	}

	public tabChanged(event: WindmillTabComponent): void {
		this.tabIndex = event.index;
	}

	private initBreadcrumbs(): void {
		const routerValue = `${commonRoutingConstants.passholders}/${this.passholderId}`;

		const breadcrumbs = [
			new Breadcrumb('general.pages.dashboard', [commonRoutingConstants.dashboard]),
			new Breadcrumb('general.pages.passholders', [commonRoutingConstants.passholders]),
			new Breadcrumb(this.passholder.name, [routerValue]),
		];

		this.breadcrumbService.setBreadcrumbs(breadcrumbs);
	}

	private subscribeToRouteParam(): void {
		this.route.paramMap.subscribe((params) => {
			this.passholderId = params.get('id') as string;
			this.getPassholderDetails();
		});
	}

	private getPassholderDetails(): void {
		if (!this.passholderId) {
			return;
		}
		this.passholderService.getPassholderDetails(this.passholderId).subscribe((passholder) => {
			this.passholder = passholder;
			this.initBreadcrumbs();
			if (new Date(this.passholder.expiringDate) < new Date()) {
				this.isPassholderExpired = true;
				return;
			}
			this.getOffersForPassholder();
		});
	}

	private getOffersForPassholder(): void {
		if (!this.passholderId) {
			return;
		}
		this.offerService.getOffersForPassholder(this.passholderId).subscribe(
			(offers) => {
				this.offers = offers;
				this.offersCount.update(() => offers.length);
			},
			() => {
				this.offers = [];
				this.offersCount.update(() => 0);
			},
		);
	}
}
