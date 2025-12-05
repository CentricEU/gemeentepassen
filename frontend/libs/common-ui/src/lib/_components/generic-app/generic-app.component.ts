import { AfterViewChecked, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
	AppType,
	AuthService,
	BreadcrumbService,
	commonRoutingConstants,
	MultilanguageService,
	SidenavService,
	TenantService,
	UserInfo,
} from '@frontend/common';
import { TranslateService } from '@ngx-translate/core';
import { CustomRoutes } from '@windmill/ng-windmill';
import { Subscription } from 'rxjs';

@Component({
	selector: 'frontend-generic-app',
	templateUrl: './generic-app.component.html',
	styleUrls: ['./generic-app.component.scss'],
})
export class GenericAppComponent implements OnInit, OnDestroy, AfterViewChecked {
	public applicationType = AppType.supplier;
	public navigationRoutes: CustomRoutes;
	public tranlationsLoaded = false;
	private translationsSubscription: Subscription;
	private authSubscription: Subscription;

	constructor(
		protected translateService: TranslateService,
		private tenantService: TenantService,
		private authService: AuthService,
		private sidenavService: SidenavService,
		private breadcrumbService: BreadcrumbService,
		private multilanguageService: MultilanguageService,
		private cdr: ChangeDetectorRef,
	) {}

	public get shouldDisplayNavigation() {
		return (
			!this.sidenavService.shouldHideNavigation(this.applicationType) &&
			this.isTenantLoaded() &&
			this.tranlationsLoaded
		);
	}

	public get shouldDisplayBreadcrumbs() {
		return this.breadcrumbService.breadcrumbs?.length > 1;
	}

	public ngOnInit(): void {
		this.getTenant();
		this.subscribeToLoginEvent();
		this.subscribeToTranslationsLoad();
		this.multilanguageService.setupLanguage();
	}

	public ngOnDestroy(): void {
		this.authSubscription?.unsubscribe();
		this.translationsSubscription?.unsubscribe();
	}

	public ngAfterViewChecked(): void {
		this.cdr.detectChanges();
	}

	public isRouteWithoutNav(): boolean {
		return this.sidenavService.shouldHideNavigation(this.applicationType);
	}

	public isTenantLoaded(): boolean {
		return !!this.tenantService.tenant;
	}

	public getMenuItemsForNavigation(): CustomRoutes {
		return [
			{
				icon: 'layout-grid_b',
				path: '/',
				name: this.translateService.instant('general.pages.dashboard'),
			},
			{
				icon: 'settings_b',
				path: '/profile/edit',
				name: this.translateService.instant('general.pages.editProfile'),
			},
			{
				icon: 'id-card_b',
				path: commonRoutingConstants.offers,
				name: this.translateService.instant('general.pages.offers'),
			},
			{
				icon: 'check-circle_b',
				path: commonRoutingConstants.offerValidation,
				name: this.translateService.instant('general.pages.offerValidation'),
			},
			{
				icon: 'hand-card_b',
				path: commonRoutingConstants.transactions,
				name: this.translateService.instant('general.pages.transactions'),
			},
		];
	}

	private subscribeToLoginEvent(): void {
		this.authSubscription = this.authService.loginEventEmitter?.subscribe(() => {
			this.getTenant();
			this.navigationRoutes = this.getMenuItemsForNavigation();
		});
	}

	private getTenant(): void {
		const tenantId = this.authService.extractSupplierInformation(UserInfo.TenantId);

		if (!tenantId) {
			return;
		}

		this.tenantService.getTenant(tenantId).subscribe((data) => {
			this.tenantService.tenant = data;
			this.cdr.detectChanges();
		});
	}

	private subscribeToTranslationsLoad(): void {
		this.translationsSubscription = this.multilanguageService.translationsLoadedEventEmitter.subscribe(() => {
			this.tranlationsLoaded = true;
			this.navigationRoutes = this.getMenuItemsForNavigation();
			this.cdr.detectChanges();
		});
	}
}
