import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Breadcrumb, BreadcrumbService } from '@frontend/common';
import { Subscription } from 'rxjs';

@Component({
	selector: 'frontend-breadcrumbs',
	templateUrl: './breadcrumbs.component.html',
	styleUrls: ['./breadcrumbs.component.scss'],
})
export class BreadcrumbsComponent implements OnInit, OnDestroy {
	public breadcrumbs: Breadcrumb[];
	private breadcrumbSubscription: Subscription;

	constructor(
		private router: Router,
		private breadcrumbService: BreadcrumbService,
	) {}

	public get displayBreadcrumbs(): boolean {
		return this.breadcrumbs && this.breadcrumbs.length > 0;
	}

	public ngOnDestroy(): void {
		this.breadcrumbSubscription?.unsubscribe();
	}

	public ngOnInit(): void {
		this.subscribeToService();
	}

	public navigateToCrumb(crumb: Breadcrumb): void {
		if (!crumb.routerLink) {
			return;
		}
		this.router.navigate(crumb.routerLink, {
			queryParams: crumb.queryParams,
		});
	}

	private subscribeToService(): void {
		this.breadcrumbSubscription = this.breadcrumbService.breadcrumbsChangedObservable.subscribe(
			(data: Breadcrumb[]) => {
				this.breadcrumbs = data;
			},
		);
	}
}
