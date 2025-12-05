import { Component, OnInit } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
	AuthService,
	commonRoutingConstants,
	ModalData,
	RejectSupplierDto,
	SupplierStatus,
	SupplierViewDto,
	TenantService,
	UserDto,
	UserInfo,
	UserService,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { DialogService } from '@windmill/ng-windmill';

import { SetupProfileComponent } from '../../_components/setup-profile/setup-profile.component';
import { OfferService } from '../../services/offer-service/offer.service';
import { SupplierService } from '../../services/supplier-service/supplier.service';

@Component({
	selector: 'frontend-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
	public shouldDisplayInfoMessage = false;
	public isProfileSet = false;
	public supplierRejectionInformation: RejectSupplierDto;
	public supplierLogoSrc: SafeUrl;

	public get extractSupplierId(): string {
		return this.authService.extractSupplierInformation(UserInfo.SupplierId) as string;
	}
	public get shouldDisableAddOfferButton(): boolean {
		return !(this.userInfoData?.isApproved && this.userInfoData?.isProfileSet);
	}

	private supplier: SupplierViewDto;
	private userInfoData: UserDto;

	constructor(
		private readonly dialogService: DialogService,
		private router: Router,
		private offerService: OfferService,
		private supplierService: SupplierService,
		private authService: AuthService,
		private userService: UserService,
		private tenantService: TenantService,
		private sanitizer: DomSanitizer,
	) {}

	public ngOnInit(): void {
		this.initializeData();
	}

	public addOffer(): void {
		this.router.navigate([commonRoutingConstants.offers]);
		this.offerService.shouldOpenOfferPopup = true;
	}

	private openSetupProfileModal(): void {
		this.dialogService
			.message(SetupProfileComponent, {
				id: 'accessible-first-dialog',
				panelClass: 'setup-profile',
				width: '80%',
				closeOnNavigation: false,
				data: {
					mainContent: 'general.success.title',
					secondContent: 'general.success.text',
					acceptButtonType: 'button-success',
					acceptButtonText: 'register.continue',
				},
			})
			?.afterClosed()
			.subscribe(() => {
				this.isProfileSet = true;
				this.checkIfShouldDisplayInfoMessage(this.userInfoData);
			});
	}

	private initializeData(): void {
		const userId = this.authService.extractSupplierInformation(UserInfo.UserId);

		if (!userId) {
			return;
		}
		this.initUserInformationData(userId);

		const supplierId = this.extractSupplierId;

		if (!supplierId) {
			return;
		}
	}

	private initUserInformationData(userId: string): void {
		this.userService.getUserInformation(userId).subscribe((data) => {
			this.userInfoData = data;
			this.userInfoData.tenantName = this.tenantService.tenant?.name;

			if (!this.userInfoData.isProfileSet) {
				this.manageProfileNotSet(this.userInfoData);
			}

			this.checkIfShouldDisplayInfoMessage(this.userInfoData);
			this.initSupplierInformation(this.userInfoData.supplierId, true);

			if (this.userInfoData.status === SupplierStatus.REJECTED) {
				this.initSupplierRejectionInformation(this.userInfoData.supplierId);
			}
		});
	}

	private initSupplierRejectionInformation(supplierId: string): void {
		this.supplierService.getSupplierRejectionInformation(supplierId)?.subscribe((data) => {
			this.supplierRejectionInformation = data;
			this.supplierRejectionInformation.tenantName = this.tenantService.tenant?.name;
			this.initSupplierInformation(supplierId, false);
		});
	}

	private checkIfShouldDisplayInfoMessage(data: UserDto): void {
		const isProfileSet = this.isProfileSet || data.isProfileSet;

		if (!data.isApproved && isProfileSet) {
			this.shouldDisplayInfoMessage = true;
			return;
		}
	}

	private initSupplierInformation(userId: string, isApprovalModal: boolean): void {
		this.supplierService.getSupplierById(userId).subscribe((data) => {
			this.supplier = data;

			if (data.logo) {
				this.setLogo(data.logo);
			}

			if (!data.hasStatusUpdate) {
				return;
			}

			if (data.status === SupplierStatus.APPROVED && isApprovalModal) {
				this.openApprovalModal();
				return;
			}

			if (data.status === SupplierStatus.REJECTED && !isApprovalModal) {
				this.openRejectionModal();
			}
		});
	}

	private setLogo(logoUrl: string): void {
		this.supplierLogoSrc = this.sanitizer.bypassSecurityTrustUrl(`data:image/jpg;base64,${logoUrl}`);
	}

	private manageProfileNotSet(data: UserDto): void {
		this.userService.userInformation = data;
		this.openSetupProfileModal();
	}

	private openApprovalModal(): void {
		const config = this.createDialogConfig(SupplierStatus.APPROVED);
		this.dialogService
			.message(CustomDialogComponent, config)
			?.afterClosed()
			.subscribe((data) => {
				this.resetHasStatusUpdate();
				if (data) {
					this.addOffer();
				}
			});
	}

	private openRejectionModal(): void {
		const config = this.createDialogConfig(SupplierStatus.REJECTED);
		this.dialogService
			.message(CustomDialogComponent, config)
			?.afterClosed()
			.subscribe((data) => {
				this.resetHasStatusUpdate();
				if (data) {
					//TODO: Add functionality in the future
				}
			});
	}

	private createDialogConfig(status: string): MatDialogConfig {
		const comments = this.supplierRejectionInformation?.comments
			? this.supplierRejectionInformation?.comments
			: '-';
		const tenantName = this.userInfoData?.tenantName ? this.userInfoData?.tenantName : '';

		const data = {
			comments: comments,
			tenantName: tenantName,
			reason: this.supplierRejectionInformation?.reason.toString(),
			email: '',
		};

		const configMap = {
			APPROVED: {
				header: 'approvedModal.header',
				title: 'approvedModal.title',
				description: 'approvedModal.description',
				cancelBtn: 'general.button.cancel',
				actionBtn: 'general.button.addOffer',
				icon: 'verified.svg',
			},
			default: {
				header: 'generalRejection.modal.header',
				title: 'generalRejection.modal.title',
				description: 'rejectSupplier.modal.description',
				cancelBtn: 'general.button.cancel',
				actionBtn: 'general.button.applyAgain',
				icon: 'rejected.svg',
			},
		};

		const { header, title, description, cancelBtn, actionBtn, icon } =
			configMap[status as keyof typeof configMap] || configMap['default'];

		const modal = new ModalData(
			header,
			title,
			description,
			cancelBtn,
			actionBtn,
			false,
			'success',
			'theme',
			icon,
			data,
		);

		return CustomDialogConfigUtil.createMessageModal(modal);
	}

	private resetHasStatusUpdate(): void {
		this.supplierService.resetSupplierHasStatusUpdate(this.supplier.id, false).subscribe();
	}
}
