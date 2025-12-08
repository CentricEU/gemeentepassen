import { Component, EventEmitter, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import {
	ActionButtonIcons,
	ActionButtons,
	AuthService,
	ColumnDataType,
	PaginatedData,
	TableActionButton,
	TableColumn,
	UserInfo,
} from '@frontend/common';
import { TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { ToastrService } from '@windmill/ng-windmill/toastr';

import { InvitationDto } from '../../_models/invitation-dto.model';
import { MunicipalitySupplierService } from '../../_services/suppliers.service';
import { InviteSuppliersComponent } from '../invite-suppliers/invite-suppliers.component';

@Component({
	selector: 'frontend-invitations',
	templateUrl: './invitations.component.html',
	styleUrls: ['./invitations.component.scss'],
	standalone: false,
})
export class InvitationsComponent extends TableBaseComponent implements OnInit, OnChanges {
	@ViewChild('invitationTable') invitationTable: TableComponent<InvitationDto>;

	@Output() countInvitationsEvent: EventEmitter<number> = new EventEmitter();

	constructor(
		private authService: AuthService,
		private supplierService: MunicipalitySupplierService,
		private translateService: TranslateService,
		private readonly toastrService: ToastrService,
		private readonly dialogService: DialogService,
	) {
		super();
	}

	public ngOnInit(): void {
		this.initializeInvitations();
	}

	public ngOnChanges(changes: SimpleChanges): void {
		if (changes['dataCount'].isFirstChange()) {
			return;
		}

		this.dataCount = changes['dataCount'].currentValue;
		this.updateInvitations();
	}

	public initializeInvitations(): void {
		this.initializeColumns();
		this.invitationTable?.initializeData();
	}

	public updateInvitations(): void {
		const { currentIndex, pageSize } = this.invitationTable.paginatedData;
		this.invitationTable.listLength = this.dataCount;
		this.invitationTable.initializePaginatedDataBasedOnPageSize(pageSize);
		this.invitationTable.paginatedData.currentIndex = currentIndex;
		this.loadData(this.invitationTable.paginatedData);
	}

	public initializeColumns(): void {
		this.allColumns = [
			new TableColumn('general.email', 'email', 'email', true, true),
			new TableColumn('invitations.sendingDate', 'createdDate', 'createdDate', true, true),
			new TableColumn('general.actions', 'actions', 'actions', true, true, ColumnDataType.DEFAULT, true),
		];
	}

	public loadData(event: PaginatedData<InvitationDto>): void {
		const tenantId = this.authService.extractSupplierInformation(UserInfo.TenantId);
		if (!tenantId) {
			return;
		}

		this.supplierService.getInvitations(event.currentIndex, event.pageSize).subscribe((invitations) => {
			this.afterDataLoaded(invitations);
		});
	}

	public afterDataLoaded(invitations: Array<InvitationDto>): void {
		const invitationsWithIcons = invitations.map((element) => ({
			...element,
			createdDate: new Date(element.createdDate).toLocaleDateString(),
			actionButtons: [
				new TableActionButton(
					ActionButtons.envelopeSend,
					'invitations.sendAgain',
					false,
					'invitations.sendAgain',
					ActionButtonIcons.link,
				),
			],
		}));

		this.invitationTable.afterDataLoaded(invitationsWithIcons);
	}

	public openResendInvitationModal(email: string): void {
		this.dialogService
			.message(InviteSuppliersComponent, {
				width: '736px',
				height: '664px',
				closeOnNavigation: false,
				disableClose: true,
				data: {
					email: email,
				},
			})
			?.afterClosed()
			.subscribe((response) => {
				if (!response) {
					return;
				}

				this.displayInvitationSentToaster();
				this.countInvitationsEvent.emit();
				this.loadData(this.invitationTable.paginatedData);
			});
	}

	public onActionButtonClicked(action: { actionButton: string; row: InvitationDto }): void {
		if (action.actionButton === ActionButtons.envelopeSend) {
			this.openResendInvitationModal(action.row.email);
		}
	}

	private displayInvitationSentToaster(): void {
		const toasterMessage = this.translateService.instant('inviteSuppliers.sentSuccessfully');

		this.toastrService.success(`<p>${toasterMessage}</p>`, '', {
			toastBackground: 'toast-light',
			enableHtml: true,
			progressBar: true,
			tapToDismiss: true,
			timeOut: 8000,
			extendedTimeOut: 8000,
		});
	}
}
