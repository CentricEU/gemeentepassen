import { AfterViewInit, ChangeDetectorRef, Component, Inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService, FormUtil, UserInfo, WorkingHoursDto, WorkingHoursService } from '@frontend/common';

import { WorkingHoursEditComponent } from '../working-hours-edit/working-hours-edit.component';

@Component({
	selector: 'frontend-working-hours-dialog',
	templateUrl: './working-hours-dialog.component.html',
	styleUrls: ['./working-hours-dialog.component.scss'],
	standalone: false,
})
export class WorkingHoursDialogComponent implements AfterViewInit {
	@ViewChild('workingHoursEdit') workingHoursEdit: WorkingHoursEditComponent;
	public isToggleActive = false;

	public formatDate = FormUtil.formatDate;
	public createTimeDateFromString = FormUtil.createTimeDateFromString;

	public get extractSupplierInformation(): string {
		return this.authService.extractSupplierInformation(UserInfo.SupplierId) as string;
	}
	constructor(
		private authService: AuthService,
		private workingHoursService: WorkingHoursService,
		private readonly dialogRef: MatDialogRef<WorkingHoursDialogComponent>,
		private cdr: ChangeDetectorRef,
		@Inject(MAT_DIALOG_DATA) public workingHoursData: WorkingHoursDto[],
	) {}

	public ngAfterViewInit(): void {
		this.getWorkingHours();
		this.cdr.detectChanges();
	}

	public closePopup(): void {
		this.dialogRef.close(this.workingHoursData);
	}

	public updateHours(): void {
		this.workingHoursData = this.workingHoursEdit.mapWorkingHours();
		this.workingHoursService
			.updateWorkingHours(this.workingHoursData, this.extractSupplierInformation)
			.subscribe((data) => {
				this.workingHoursData = data;
				this.closePopup();
			});
		return;
	}

	private getWorkingHours(): void {
		this.workingHoursEdit.populateForm(this.workingHoursData);
	}
}
