import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { commonRoutingConstants } from '@frontend/common';
import { WindmillTabComponent } from '@windmill/ng-windmill/tabs';

@Component({
	selector: 'frontend-supplier-details',
	templateUrl: './supplier-details.component.html',
	styleUrls: ['./supplier-details.component.scss'],
	standalone: false,
})
export class SupplierDetailsComponent implements OnInit {
	public supplierId: string;
	public tabIndex = 0;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
	) {}

	public ngOnInit(): void {
		this.subscribeToRouteParam();
	}

	public tabChanged(event: WindmillTabComponent): void {
		this.tabIndex = event.index;
		if (!this.supplierId) {
			return;
		}
		const computedLocation =
			this.tabIndex === 0 ? commonRoutingConstants.supplierDetails : commonRoutingConstants.supplierOffers;
		this.router.navigate([computedLocation.replace(':id', this.supplierId)], { replaceUrl: false });
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
