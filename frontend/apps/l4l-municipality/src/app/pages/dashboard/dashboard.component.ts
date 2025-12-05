import { Component, OnInit } from '@angular/core';
import { AuthService, InfoWidgetData, SupplierStatus, UserInfo } from '@frontend/common';
import { forkJoin } from 'rxjs';

import { PassholdersService } from '../../_services/passholders.service';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';

@Component({
	selector: 'frontend-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
	public passholdersCount = 0;
	public suppliersCount = 0;

	public get widgetsData(): InfoWidgetData[] {
		return [
			{
				title: 'dashboard.metrics.passholders',
				value: this.passholdersCount,
				icon: 'id-card_b',
			},
			{
				title: 'dashboard.metrics.suppliers',
				value: this.suppliersCount,
				icon: 'shop_b',
			},
			{
				title: 'dashboard.metrics.transactions',
				value: '0',
				icon: 'hand-card_b',
			},
		];
	}

	public get tenantId(): string | undefined {
		return this.authService.extractSupplierInformation(UserInfo.TenantId);
	}

	constructor(
		private passholderService: PassholdersService,
		private municipalitySupplierService: MunicipalitySupplierService,
		private authService: AuthService,
	) {}

	public ngOnInit(): void {
		this.initInfoWidgetsData();
	}

	private initInfoWidgetsData(): void {
		if (!this.tenantId) {
			return;
		}

		const sources = {
			suppliersCount: this.municipalitySupplierService.countSuppliers(this.tenantId, [SupplierStatus.APPROVED]),
			passholdersCount: this.passholderService.countPassholders(),
		};

		forkJoin(sources).subscribe({
			next: (result) => {
				this.passholdersCount = result.passholdersCount;
				this.suppliersCount = result.suppliersCount;
			},
		});
	}
}
