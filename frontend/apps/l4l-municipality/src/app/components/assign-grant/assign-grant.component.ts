import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import {
	AssignPassholderGrants,
	ColumnDataType,
	GrantDto,
	GrantService,
	ModalData,
	PassholderViewDto,
	TableColumn,
	WarningDialogData,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil, TableBaseComponent, TableComponent } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService, ToastrService } from '@windmill/ng-windmill';

import { PassholdersService } from '../../_services/passholders.service';

@Component({
	selector: 'frontend-assign-grant',
	templateUrl: './assign-grant.component.html',
	styleUrls: ['./assign-grant.component.scss'],
})
export class AssignGrantComponent extends TableBaseComponent implements OnInit {
	@ViewChild('assignGrantTable') assignGrantTable: TableComponent<GrantDto>;

	public allGrantsInitialState: GrantDto[];
	public passholderObjects: PassholderViewDto[];
	public hasUpdates = false;

	public get isMultipleAssign(): boolean {
		return this.data?.isMultipleAssign;
	}

	constructor(
		private readonly dialogService: DialogService,
		private readonly dialogRef: MatDialogRef<AssignGrantComponent>,
		@Inject(MAT_DIALOG_DATA) private data: any,
		private grantService: GrantService,
		private passholderService: PassholdersService,
		private readonly toastrService: ToastrService,
		private translateService: TranslateService,
	) {
		super();
		this.passholderObjects = data.parentRecord as PassholderViewDto[];
	}

	public ngOnInit(): void {
		this.initializeColumns();
	}

	public saveGrants(): void {
		const selectedGrants = this.assignGrantTable.getSelectedElements();

		if (this.isMultipleAssign) {
			this.assignPassholderGrants(selectedGrants);
		} else {
			this.updatePassholder(selectedGrants);
		}

		const toastText = this.translateService.instant('passholders.successAssignGrants');
		this.toastrService.success(toastText, '', { toastBackground: 'toast-light' });
	}

	public closePopup(): void {
		if (this.hasUpdates) {
			this.openWarningModal();
			return;
		}
		this.performClose();
	}

	public performClose(success?: boolean): void {
		this.dialogRef.close(success);
	}

	public onCheckboxClicked(value: boolean): void {
		this.hasUpdates = value;
	}

	public loadGrants(): void {
		this.grantService.getAllGrants(true).subscribe((data) => {
			this.assignGrantTable.currentDisplayedPage = data;
			this.dataCount = data.length;

			if (this.isMultipleAssign) {
				return;
			}

			this.initializeSelectedState(this.passholderObjects[0]);
		});
	}

	private updatePassholder(selectedGrants: GrantDto[]): void {
		this.passholderObjects[0].grants = selectedGrants;

		this.passholderService.updatePassholder(this.passholderObjects[0]).subscribe(() => {
			this.closeModal();
		});
	}

	private assignPassholderGrants(selectedGrants: GrantDto[]): void {
		const grantIds = selectedGrants.map((grant) => grant.id).filter((id): id is string => id !== undefined);

		const passholderIds = this.passholderObjects.map((passholder) => passholder.id);

		const assignPassholderGrants: AssignPassholderGrants = new AssignPassholderGrants(passholderIds, grantIds);

		this.passholderService.assignGrants(assignPassholderGrants).subscribe(() => {
			this.closeModal();
		});
	}

	private closeModal(): void {
		this.hasUpdates = true;
		this.performClose(true);
	}

	private createWarningDialogConfig(): MatDialogConfig {
		const data = new WarningDialogData();

		const modal = new ModalData(
			'grants.assigning',
			'',
			'grants.warningMessage',
			'general.button.stay',
			'general.button.cancel',
			false,
			'warning',
			'theme',
			'',
			data,
		);
		return CustomDialogConfigUtil.createMessageModal(modal);
	}

	private openWarningModal(): void {
		const config = this.createWarningDialogConfig();
		this.dialogService
			.message(CustomDialogComponent, config)
			?.afterClosed()
			.subscribe((data) => {
				if (!data) {
					return;
				}
				this.performClose();
			});
	}

	private initializeColumns(): void {
		this.allColumns = [
			new TableColumn('checkbox', 'checkbox', 'checkbox', true, true, ColumnDataType.DEFAULT, true),
			new TableColumn('passholders.grantName', 'title', 'title', true, false),
			new TableColumn('passholders.amoungGranted', 'amount', 'amount', true, false, ColumnDataType.CURRENCY),
			new TableColumn('grants.beneficiaries', 'createFor', 'createFor', true, false),
		];
	}

	private initializeSelectedState(passholderObject: PassholderViewDto): void {
		this.assignGrantTable.currentDisplayedPage.forEach((grant) => {
			grant.selected = passholderObject.grants.some((activeGrant) => activeGrant.id === grant.id);
		});
	}
}
