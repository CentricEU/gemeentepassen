import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { commonRoutingConstants } from '@frontend/common';

@Component({
	selector: 'frontend-supplier-details',
	templateUrl: './supplier-details.component.html',
	styleUrls: ['./supplier-details.component.scss'],
})
export class SupplierDetailsComponent {
	public supplierId: string;
	public tabIndex = 0;

	constructor(
		private route: ActivatedRoute,
		private location: Location,
	) {}

	public ngOnInit(): void {
		this.subscribeToRouteParam();
	}

	public tabChanged(event: MatTabChangeEvent): void {
		this.tabIndex = event.index;
		if (!this.supplierId) {
			return;
		}
		const computedLocation =
			this.tabIndex === 0 ? commonRoutingConstants.supplierDetails : commonRoutingConstants.supplierOffers;
		this.location.go(computedLocation.replace(':id', this.supplierId));
	}

	private subscribeToRouteParam(): void {
		this.route.paramMap.subscribe((params) => {
			this.supplierId = params.get('id') as string;
		});

		if (!this.route.snapshot.data['route']) {
			return;
		}
		this.tabIndex = 1;
	}
}
