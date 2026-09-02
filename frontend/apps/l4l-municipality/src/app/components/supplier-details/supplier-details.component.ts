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

	private readonly tabRoutes = [
		commonRoutingConstants.supplierDetails,
		commonRoutingConstants.supplierOffers,
		commonRoutingConstants.supplierHistory,
	];

	constructor(
		private route: ActivatedRoute,
		private router: Router,
	) {}

	public ngOnInit(): void {
		this.subscribeToRouteParam();
	}

	public tabChanged(event: WindmillTabComponent): void {
		if (!this.supplierId) {
			return;
		}

		const computedLocation = this.tabRoutes[event.index];
		this.router.navigate([computedLocation.replace(':id', this.supplierId)], { replaceUrl: false });
	}

	private subscribeToRouteParam(): void {
		this.route.paramMap.subscribe((params) => {
			this.supplierId = params.get('id') as string;
		});

		const currentRoute = this.route.snapshot.data['route'];

		if (!currentRoute) {
			return;
		}

		const index = this.tabRoutes.indexOf(currentRoute);
		this.tabIndex = index !== -1 ? index : 0;
	}
}
