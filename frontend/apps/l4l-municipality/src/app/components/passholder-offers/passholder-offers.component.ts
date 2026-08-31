import { Component, inject, Input, OnInit } from '@angular/core';
import { ColumnDataType, OfferTableDto, OfferUseDto, TableColumn } from '@frontend/common';
import { CommonUiModule, WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { CentricDataGridModule } from '@windmill/ng-windmill/data-grid';

import { PendingOffersService } from '../../pending-offers.service';

@Component({
	selector: 'frontend-passholder-offers',
	imports: [CentricDataGridModule, TranslateModule, CommonUiModule, WindmillModule],
	templateUrl: './passholder-offers.component.html',
	styleUrl: './passholder-offers.component.scss',
})
export class PassholderOffersComponent implements OnInit {
	@Input() public passholderId?: string;
	@Input() public offers: OfferTableDto[];

	public allColumns: TableColumn[] = [];
	public fixedContentCols: string[] = [];
	public showFilters = true;

	private readonly offerService = inject(PendingOffersService);

	public get columnDataTypes(): typeof ColumnDataType {
		return ColumnDataType;
	}

	public ngOnInit(): void {
		this.initializeColumns();
	}

	public downloadCode(event: OfferTableDto): void {
		if (!event || !event.id || !this.passholderId) {
			return;
		}

		this.offerService
			.downloadOffer(new OfferUseDto(this.passholderId, event.id, new Date().toISOString()))
			.subscribe((response) => {
				this.downloadDiscountCode(response, this.passholderId);
			});
	}

	private downloadDiscountCode(response: Blob, passholderId: string | undefined): void {
		const blob = new Blob([response], { type: 'application/pdf' });
		const url = window.URL.createObjectURL(blob);
		const anchor = Object.assign(document.createElement('a'), {
			href: url,
			download: `Gemeente_code_${passholderId}.pdf`,
		});
		anchor.click();
		window.URL.revokeObjectURL(url);
	}

	public trackByMethod(index: number, column: TableColumn): string {
		const columnProperty = column.property || '';
		return String(index) + String(columnProperty);
	}

	public hasData(): boolean {
		return !!this.offers && this.offers.length > 0;
	}

	private initializeColumns(): void {
		this.allColumns = [
			new TableColumn('offer.supplierName', 'supplierName', 'supplierName', true, true),
			new TableColumn('offer.offerName', 'title', 'title', true, true),
			new TableColumn('offer.offerType', 'offerType', 'offerType', true, true, ColumnDataType.TRANSLATION),
			new TableColumn('genericFields.validity.label', 'validity', 'validity', true, true),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.ACTIONS),
		];

		this.fixedContentCols = [];
		this.allColumns.forEach((item) => {
			this.fixedContentCols.push(item['property']);
		});
	}
}
