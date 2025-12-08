import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
	AuthService,
	CommonL4LModule,
	GenericStatusEnum,
	NavigationService,
	SupplierViewDto,
	TenantService,
	UserInfo,
} from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ToastrService } from '@windmill/ng-windmill/toastr';

import { SupplierService } from '../../services/supplier-service/supplier.service';

@Component({
	selector: 'frontend-header',
	imports: [CommonModule, TranslateModule, WindmillModule, CommonL4LModule],
	templateUrl: './header.component.html',
	styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
	private supplier: SupplierViewDto;
	private readonly authService = inject(AuthService);
	private readonly navigationService = inject(NavigationService);
	private readonly tenantService = inject(TenantService);
	private readonly supplierService = inject(SupplierService);
	private readonly toastrService = inject(ToastrService);
	private readonly translateService = inject(TranslateService);

	public ngOnInit(): void {
		this.loadSupplierInformation();
	}

	public logout(): void {
		this.authService.logout();
		this.navigationService.reloadCurrentRoute();
	}

	public get tenantLogo(): string {
		return this.tenantService.tenantLogo;
	}

	public get supplierName(): string {
		return this.supplier?.companyName || '';
	}

	private loadSupplierInformation(): void {
		const supplierId = this.authService.extractSupplierInformation(UserInfo.SupplierId) as string;
		this.supplierService.getSupplierById(supplierId).subscribe((supplier) => {
			if (supplier.status !== GenericStatusEnum.APPROVED) {
				this.authService.logout();
				this.displayErrorToaster();
				this.navigationService.reloadCurrentRoute();
			}
			this.supplier = supplier;
		});
	}

	private displayErrorToaster(): void {
		const toasterMessage = this.translateService.instant(`errors.supplierNotApproved`);

		this.toastrService.error(`<p>${toasterMessage}</p>`, '', {
			toastBackground: 'toast-light',
			enableHtml: true,
			progressBar: true,
			tapToDismiss: true,
			timeOut: 8000,
			extendedTimeOut: 8000,
		});
	}
}
