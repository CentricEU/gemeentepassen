import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
	CentricAlertModule,
	CentricBreadcrumbsModule,
	CentricButtonModule,
	CentricCardModule,
	CentricChipsModule,
	CentricComplexFormModule,
	CentricDataGridModule,
	CentricDialogModule,
	CentricForgotPasswordModule,
	CentricIcon2Module,
	CentricLinkModule,
	CentricLoginModule,
	CentricMatTabsModule,
	CentricNotificationBadgeModule,
	CentricPanelModule,
	CentricRegisterModule,
	CentricSetNewPasswordModule,
	CentricSlideToggle2Module,
	CentricTextarea2Module,
	CentricUploadAreaModule,
	WindmillCheckboxModule,
	WindmillDatePickerModule,
	WindmillDropdownSearchModule,
	WindmillInputModule,
	WindmillPaginatorModule,
	WindmillTooltipModule,
} from '@windmill/ng-windmill';

@NgModule({
	imports: [CommonModule],
	exports: [
		FormsModule,
		ReactiveFormsModule,
		WindmillDatePickerModule,
		CentricDataGridModule,
		CentricLoginModule,
		CentricRegisterModule,
		CentricAlertModule,
		CentricUploadAreaModule,
		CentricComplexFormModule,
		WindmillDropdownSearchModule,
		CentricCardModule,
		CentricButtonModule,
		CentricDialogModule,
		WindmillTooltipModule,
		CentricIcon2Module,
		CentricPanelModule,
		WindmillPaginatorModule,
		CentricMatTabsModule,
		WindmillCheckboxModule,
		WindmillInputModule,
		CentricTextarea2Module,
		CentricLinkModule,
		CentricForgotPasswordModule,
		CentricSetNewPasswordModule,
		CentricChipsModule,
		CentricBreadcrumbsModule,
		CentricNotificationBadgeModule,
		CentricSlideToggle2Module,
	],
})
export class WindmillModule {
	public static forRoot(): ModuleWithProviders<WindmillModule> {
		return {
			ngModule: WindmillModule,
		};
	}
}
