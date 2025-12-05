import { Component, OnInit } from '@angular/core';
import { AuthService, UserInfo, WeekDays, WorkingHoursDto, WorkingHoursService } from '@frontend/common';
import { DialogService } from '@windmill/ng-windmill';

import { WorkingHoursDialogComponent } from '../working-hours-dialog/working-hours-dialog.component';

@Component({
	selector: 'frontend-working-hours',
	templateUrl: './working-hours.component.html',
	styleUrls: ['./working-hours.component.scss'],
})
export class WorkingHoursComponent implements OnInit {
	public workingHoursData: WorkingHoursDto[] = [];

	public get extractSupplierInformation(): string {
		return this.authService.extractSupplierInformation(UserInfo.SupplierId) as string;
	}

	constructor(
		private dialogService: DialogService,
		private authService: AuthService,
		private workingHoursService: WorkingHoursService,
	) {}

	public ngOnInit(): void {
		this.getWorkingHours();
	}

	public openSaveScheduleModal(): void {
		this.dialogService
			.message(WorkingHoursDialogComponent, {
				width: '676px',
				height: '600px',
				closeOnNavigation: false,
				data: this.workingHoursData,
			})
			?.afterClosed()
			.subscribe((data: WorkingHoursDto[]) => {
				if (!data) {
					return;
				}
				this.workingHoursData = data;
			});
	}

	public isDayDataEmpty(): boolean {
		return !this.workingHoursData.some((dayData) => dayData.isChecked);
	}

	public dayName(dayData: WorkingHoursDto): string {
		const daysData = Object.values(WeekDays);
		return 'general.weekdays.' + daysData[dayData.day - 1];
	}

	public workingDailyHours(dayData: WorkingHoursDto): string {
		return `${dayData.openTime.substring(0, 5)} - ${dayData.closeTime.substring(0, 5)}`;
	}

	private getWorkingHours(): void {
		this.workingHoursService.getWorkingHours(this.extractSupplierInformation).subscribe((data) => {
			if (!data.length) {
				return;
			}

			data.forEach((savedDay) => {
				this.workingHoursData.push(
					new WorkingHoursDto(
						savedDay.day,
						savedDay.openTime,
						savedDay.closeTime,
						savedDay.isChecked,
						savedDay.id,
					),
				);
			});
		});
	}
}
