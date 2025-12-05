import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonL4LModule, Environment } from '@frontend/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CentricInputTimepicker2Module, CentricSidenavModule } from '@windmill/ng-windmill';
import { CentricToastrModule } from '@windmill/ng-windmill';
import { RECAPTCHA_SETTINGS, RecaptchaFormsModule, RecaptchaModule } from 'ng-recaptcha';

import { AppLoaderComponent } from './_components/app-loader/app-loader.component';
import { BreadcrumbsComponent } from './_components/breadcrumbs/breadcrumbs.component';
import { ChangePasswordComponent } from './_components/change-password/change-password.component';
import { ChipCellComponent } from './_components/chip-cell/chip-cell.component';
import { ChipRemainingDialogComponent } from './_components/chip-remaining-dialog/chip-remaining-dialog.component';
import { ContactInformationComponent } from './_components/contact-information/contact-information.component';
import { CustomDialogComponent } from './_components/custom-dialog/custom-dialog.component';
import { CustomDialogWithTimerComponent } from './_components/custom-dialog-with-timer/custom-dialog-with-timer.component';
import { DragFileComponent } from './_components/drag-file/drag-file.component';
import { EmailActionComponent } from './_components/email-action/email-action.component';
import { GeneralInformationComponent } from './_components/general-information/general-information.component';
import { GenericAppComponent } from './_components/generic-app/generic-app.component';
import { InfoWidgetComponent } from './_components/info-widget/info-widget.component';
import { LoginComponent } from './_components/login/login.component';
import { LogoTitleComponent } from './_components/logo-title/logo-title.component';
import { NoDataComponent } from './_components/no-data/no-data.component';
import { OfferInformationComponent } from './_components/offer-information/offer-information.component';
import { SidenavComponent } from './_components/sidenav/sidenav.component';
import { SupplierProfileComponent } from './_components/supplier-profile/supplier-profile.component';
import { SupplierInformationPanelComponent } from './_components/supplier-profile-panel/supplier-profile-panel.component';
import { TableComponent } from './_components/table/table.component';
import { TableBaseComponent } from './_components/table-base/table-base.component';
import { TableColumnsManagerComponent } from './_components/table-columns-manager/table-columns-manager.component';
import { TimeBusinessHoursComponent } from './_components/time-business-hours/time-business-hours.component';
import { TimeSlotsComponent } from './_components/time-slots/time-slots.component';
import { WorkingHoursComponent } from './_components/working-hours/working-hours.component';
import { WorkingHoursDialogComponent } from './_components/working-hours-dialog/working-hours-dialog.component';
import { WorkingHoursEditComponent } from './_components/working-hours-edit/working-hours-edit.component';
import { HttpLoaderFactory } from './_functions/htpp-loader.factory';
import { FileSizePipe } from './_pipes/file-size.pipe';
import { WindmillModule } from './windmil.module';

@NgModule({
	imports: [
		CommonModule,
		CommonL4LModule,
		CentricInputTimepicker2Module,
		CentricSidenavModule,
		CentricToastrModule.forRoot(),
		FormsModule,
		RecaptchaModule,
		RecaptchaFormsModule,
		WindmillModule.forRoot(),
		TranslateModule.forRoot({
			loader: {
				provide: TranslateLoader,
				useFactory: HttpLoaderFactory,
				deps: [HttpClient],
			},
		}),
	],
	declarations: [
		SidenavComponent,
		TimeSlotsComponent,
		TableColumnsManagerComponent,
		TableComponent,
		LoginComponent,
		CustomDialogComponent,
		NoDataComponent,
		LogoTitleComponent,
		GenericAppComponent,
		EmailActionComponent,
		ChangePasswordComponent,
		ContactInformationComponent,
		GeneralInformationComponent,
		OfferInformationComponent,
		DragFileComponent,
		FileSizePipe,
		ChipCellComponent,
		SupplierProfileComponent,
		SupplierInformationPanelComponent,
		ChipRemainingDialogComponent,
		BreadcrumbsComponent,
		WorkingHoursComponent,
		TimeBusinessHoursComponent,
		CustomDialogWithTimerComponent,
		EmailActionComponent,
		WorkingHoursDialogComponent,
		WorkingHoursEditComponent,
		TableBaseComponent,
		AppLoaderComponent,
		InfoWidgetComponent,
	],
	exports: [
		SidenavComponent,
		ContactInformationComponent,
		GeneralInformationComponent,
		OfferInformationComponent,
		SupplierProfileComponent,
		SupplierInformationPanelComponent,
		TableColumnsManagerComponent,
		TableComponent,
		TableBaseComponent,
		DragFileComponent,
		NoDataComponent,
		ChipCellComponent,
		BreadcrumbsComponent,
		LogoTitleComponent,
		TimeSlotsComponent,
		CustomDialogWithTimerComponent,
		WorkingHoursEditComponent,
		AppLoaderComponent,
		InfoWidgetComponent,
	],
	providers: [
		{
			provide: RECAPTCHA_SETTINGS,
			useValue: {
				siteKey: '6Ld-jb4pAAAAAI34pOa8uqqGX407eykhcPLDTdO7',
			},
		},
		FileSizePipe,
	],
})
export class CommonUiModule {
	public static forRoot(environment: Environment): ModuleWithProviders<CommonUiModule> {
		return {
			ngModule: CommonUiModule,
			providers: [
				{
					provide: 'env',
					useValue: environment,
				},
			],
		};
	}
}
