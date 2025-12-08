import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {
	AuthService,
	CharacterLimitMessageService,
	CitizenGroupsService,
	CommonL4LModule,
	commonRoutingConstants,
	FormUtil,
	TenantService,
	TEXT_AREA_MAX_LENGTH,
	UserInfo,
} from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@windmill/ng-windmill/toastr';

@Component({
	selector: 'app-none-category-fit',
	imports: [CommonL4LModule, TranslateModule, WindmillModule],
	templateUrl: './none-category-fit.component.html',
	styleUrl: './none-category-fit.component.scss',
})
export class NoneCategoryFitComponent implements OnInit {
	public municipalityName = '';
	public phoneNumber = '';
	public emailAddress = '';
	public noneCategoryFitForm: FormGroup;
	public readonly maxLength = TEXT_AREA_MAX_LENGTH;

	public hasFormControlRequiredErrors = FormUtil.hasFormControlRequiredErrors;
	public validationFunctionError = FormUtil.validationFunctionError;

	public readonly characterLimitMessageService = inject(CharacterLimitMessageService);
	private readonly authService = inject(AuthService);
	private readonly router = inject(Router);
	private readonly tenantService = inject(TenantService);
	private readonly citizenGroupsService = inject(CitizenGroupsService);
	private readonly translateService = inject(TranslateService);
	private readonly toastrService = inject(ToastrService);

	public ngOnInit(): void {
		this.initForm();
		this.getTenantInformation();
	}

	public sendMessage(): void {
		this.citizenGroupsService
			.sendMessageForNoneCategoryFit(this.noneCategoryFitForm.get('message')?.value)
			.subscribe(() => {
				this.noneCategoryFitForm.reset();
				this.displayMessageSentToaster();
			});
	}

	public goBack(): void {
		this.router.navigate([commonRoutingConstants.citizenGroupAssignment]);
	}

	private getTenantInformation(): void {
		const tenantId = this.authService.extractSupplierInformation(UserInfo.TenantId);

		if (!tenantId) {
			return;
		}

		this.tenantService.getTenant(tenantId).subscribe((data) => {
			this.tenantService.tenant = data;
			this.municipalityName = data.name ?? '';
			this.phoneNumber = data.phone ?? '';
			this.emailAddress = data.email ?? '';
		});
	}

	private initForm(): void {
		this.characterLimitMessageService.messageCount = this.maxLength;
		this.noneCategoryFitForm = new FormGroup({
			message: new FormControl('', [Validators.required, Validators.maxLength(this.maxLength)]),
		});
	}

	private displayMessageSentToaster(): void {
		const toasterMessage = this.translateService.instant('noneCategoryFit.messageSentSucesfully');

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
