import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CentricAlertModule } from '@windmill/ng-windmill/alert';
import { CentricBreadcrumbsModule } from '@windmill/ng-windmill/breadcrumbs';
import { CentricButtonModule } from '@windmill/ng-windmill/button';
import { WindmillCheckboxModule } from '@windmill/ng-windmill/checkbox';
import { CentricChipsModule } from '@windmill/ng-windmill/chips';
import { CentricComplexFormModule } from '@windmill/ng-windmill/complex-form';
import { CentricDataGridModule } from '@windmill/ng-windmill/data-grid';
import { WindmillDatePickerModule } from '@windmill/ng-windmill/date-picker';
import { CentricCardModule } from '@windmill/ng-windmill/deprecated-card';
import { CentricPanelModule } from '@windmill/ng-windmill/deprecated-panel';
import { CentricDialogModule } from '@windmill/ng-windmill/dialog';
import { WindmillDropdownSearchModule } from '@windmill/ng-windmill/dropdown-search';
import { CentricForgotPasswordModule } from '@windmill/ng-windmill/forgot-password';
import { CentricHeaderModule } from '@windmill/ng-windmill/header';
import { CentricIcon2Module } from '@windmill/ng-windmill/icon';
import { WindmillInputModule } from '@windmill/ng-windmill/input';
import { CentricLinkModule } from '@windmill/ng-windmill/link';
import { CentricLoginModule } from '@windmill/ng-windmill/login';
import { CentricNotificationBadgeModule } from '@windmill/ng-windmill/notification-badge';
import { WindmillPaginatorModule } from '@windmill/ng-windmill/paginator';
import { CentricRadioModule } from '@windmill/ng-windmill/radio';
import { CentricRegisterModule } from '@windmill/ng-windmill/register';
import { WindmillSelectModule } from '@windmill/ng-windmill/select';
import { CentricSetNewPasswordModule } from '@windmill/ng-windmill/set-new-password';
import { CentricSlideToggle2Module } from '@windmill/ng-windmill/slide-toggle';
import { WindmillTabsModule } from '@windmill/ng-windmill/tabs';
import { CentricTextarea2Module } from '@windmill/ng-windmill/textarea';
import { WindmillTooltipModule } from '@windmill/ng-windmill/tooltip';
import { CentricUploadAreaModule } from '@windmill/ng-windmill/upload-area';

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
		WindmillCheckboxModule,
		WindmillInputModule,
		CentricTextarea2Module,
		CentricLinkModule,
		CentricForgotPasswordModule,
		CentricSetNewPasswordModule,
		CentricChipsModule,
		CentricBreadcrumbsModule,
		CentricHeaderModule,
		CentricNotificationBadgeModule,
		CentricSlideToggle2Module,
		CentricRadioModule,
		WindmillTabsModule,
		WindmillSelectModule,
	],
})
export class WindmillModule {
	public static forRoot(): ModuleWithProviders<WindmillModule> {
		return {
			ngModule: WindmillModule,
		};
	}
}
