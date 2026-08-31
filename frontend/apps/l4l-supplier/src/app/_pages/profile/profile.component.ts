import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, commonRoutingConstants, UserInfo } from '@frontend/common';
import { WindmillTabComponent } from '@windmill/ng-windmill/tabs';

@Component({
	selector: 'frontend-profile.component',
	templateUrl: './profile.component.html',
	styleUrl: './profile.component.scss',
	standalone: false,
})
export class ProfileComponent implements OnInit {
	public tabIndex = 0;
	public supplierId: string;

	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private authService = inject(AuthService);

	private readonly tabRoutes = [commonRoutingConstants.editProfile, commonRoutingConstants.history];

	public ngOnInit(): void {
		this.initSupplierId();
		this.subscribeToRouteParam();
	}

	public tabChanged(event: WindmillTabComponent): void {
		this.router.navigate([this.tabRoutes[event.index]], { replaceUrl: false });
	}

	private subscribeToRouteParam(): void {
		const currentRoute = this.route.snapshot.url.join('/');

		if (!currentRoute) {
			return;
		}

		const index = this.tabRoutes.indexOf(currentRoute);
		this.tabIndex = index !== -1 ? index : 0;
	}

	private initSupplierId(): void {
		this.supplierId = this.authService.extractSupplierInformation(UserInfo.SupplierId) as string;
	}
}
