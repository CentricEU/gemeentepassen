import { Component, OnInit } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
	AuthService,
	commonRoutingConstants,
	ModalData,
	RejectSupplierDto,
	SupplierRejectionService,
	SupplierStatus,
	SupplierViewDto,
	TenantService,
	UserDto,
	UserInfo,
	UserService,
} from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { TranslateService } from '@ngx-translate/core';
import { DialogService } from '@windmill/ng-windmill/dialog';

import { SetupProfileComponent } from '../../_components/setup-profile/setup-profile.component';
import { OfferService } from '../../services/offer-service/offer.service';
import { SupplierService } from '../../services/supplier-service/supplier.service';

@Component({
	selector: 'frontend-dashboard',
	templateUrl: './dashboard.component.html',
	styleUrls: ['./dashboard.component.scss'],
	standalone: false,
})
export class DashboardComponent implements OnInit {
	public shouldDisplayInfoMessage = false;
	public isProfileSet = false;
	public supplierRejectionInformation: RejectSupplierDto;
	public supplierLogoSrc: SafeUrl;
	public qrTranslationLabel: string;
	public qrImageUrl: SafeUrl;
	public qrHasEmptyState = true;
	public skipErrorToaster = false;
	public areRequestLoaded = false;
	private qrObjectUrl: string;

	public get extractSupplierId(): string {
		return this.authService.extractSupplierInformation(UserInfo.SupplierId) as string;
	}
	public get shouldDisableAddOfferButton(): boolean {
		return !(this.userInfoData?.isApproved && this.userInfoData?.isProfileSet);
	}

	private supplier: SupplierViewDto;
	private userInfoData: UserDto;

	public get userFirstName(): string {
		return this.userInfoData?.firstName || '';
	}

	constructor(
		private readonly dialogService: DialogService,
		private readonly supplierRejectionService: SupplierRejectionService,
		private readonly translateService: TranslateService,
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

	// public downloadQrCodeImage(): void {
	// 	const link = document.createElement('a');
	// 	link.href = this.qrObjectUrl;
	// 	link.download = 'QR-L4L.png';
	// 	document.body.appendChild(link);
	// 	link.click();
	// 	document.body.removeChild(link);
	// }

	// private fetchQrCodeImage(): void {
	// 	this.supplierService.getQRCodeImage().subscribe((blob) => {
	// 		this.qrObjectUrl = URL.createObjectURL(blob);
	// 		this.qrImageUrl = this.sanitizer.bypassSecurityTrustUrl(this.qrObjectUrl);
	// 		this.qrHasEmptyState = false;
	// 	});
	// }

	private openSetupProfileModal(): void {
		this.dialogService
			.message(SetupProfileComponent, {
				id: 'accessible-first-dialog',
				panelClass: 'setup-profile',
				width: '80%',
				disableClose: true,
				data: {
					mainContent: 'general.success.title',
					secondContent: 'general.success.text',
					acceptButtonType: 'high-emphasis-success',
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

			//this.initializeQrCode(data.isApproved);
		});
	}

	// private initializeQrCode(isApproved: boolean): void {
	// 	if (isApproved) {
	// 		this.qrTranslationLabel = 'dashboard.qrCode.textApproved';
	// 		this.fetchQrCodeImage();
	// 		return;
	// 	}

	// 	this.qrImageUrl = '/assets/images/QR_empty.svg';
	// 	this.qrTranslationLabel = 'dashboard.qrCode.textPending';
	// }

	private initSupplierRejectionInformation(supplierId: string): void {
		this.supplierRejectionService.getSupplierRejectionInformation(supplierId)?.subscribe((data) => {
			this.supplierRejectionInformation = data;
			this.supplierRejectionInformation.tenantName = this.tenantService.tenant?.name;
			this.supplierRejectionInformation.reason = data.reasonLabel;
			this.initSupplierInformation(supplierId, false);
		});
	}

	private checkIfShouldDisplayInfoMessage(data: UserDto): void {
		const isProfileSet = this.isProfileSet || data.isProfileSet;

		if (!data.isApproved && isProfileSet && data.status !== SupplierStatus.REJECTED) {
			this.shouldDisplayInfoMessage = true;
			return;
		}
	}

	private initSupplierInformation(userId: string, isApprovalModal: boolean): void {
		this.supplierService.getSupplierById(userId).subscribe((supplier) => {
			this.supplier = supplier;

			if (supplier.logo) {
				this.setLogo(supplier.logo);
			}

			if (!supplier.hasStatusUpdate) {
				this.areRequestLoaded = true;
				return;
			}

			this.handleSupplierStatus(supplier, isApprovalModal);
		});
	}

	private handleSupplierStatus(supplier: SupplierViewDto, isApprovalModal: boolean): void {
		const { status } = supplier;

		if (status === SupplierStatus.APPROVED && isApprovalModal) {
			this.areRequestLoaded = true;
			this.openApprovalModal();
			return;
		}

		if (status === SupplierStatus.PENDING && isApprovalModal) {
			this.areRequestLoaded = true;
			this.checkReapplyQueryParamAndDisplayPendingModal();
			return;
		}

		if (status === SupplierStatus.REJECTED && !isApprovalModal) {
			this.areRequestLoaded = true;
			this.openRejectionModal();
		}
	}

	private checkReapplyQueryParamAndDisplayPendingModal(): void {
		this.router.routerState.root.queryParams.subscribe((params) => {
			if (params['reapply'] === 'true') {
				this.displayApprovalWaitingPopup();
			}
		});
	}

	private displayApprovalWaitingPopup(): void {
		const approvalWaitingModalData = new ModalData(
			'setupProfile.setupSuccessful',
			'setupProfile.setupSuccessful',
			'setupProfile.success.text',
			'general.button.cancel',
			'setupProfile.continue',
			false,
			'success',
			'theme',
			'wait-clock.svg',
		);

		this.dialogService
			.message(CustomDialogComponent, CustomDialogConfigUtil.createMessageModal(approvalWaitingModalData))
			?.afterClosed()
			.subscribe(() => {
				this.router.navigate([], {
					queryParams: { reapply: null },
					queryParamsHandling: 'merge',
				});
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
		this.skipErrorToaster = true;

		const config = this.createDialogConfig(SupplierStatus.REJECTED);
		this.dialogService
			.message(CustomDialogComponent, config)
			?.afterClosed()
			.subscribe((data) => {
				this.resetHasStatusUpdate();
				if (data) {
					this.reapplySupplierProfile();
				}
			});
	}

	private reapplySupplierProfile(): void {
		this.router.navigate([commonRoutingConstants.editProfile]);
	}

	private createDialogConfig(status: string): MatDialogConfig {
		const comments = this.supplierRejectionInformation?.comments
			? this.supplierRejectionInformation?.comments
			: '-';
		const tenantName = this.userInfoData?.tenantName ? this.userInfoData?.tenantName : '';
		const reason = this.supplierRejectionInformation?.reason?.toString?.();

		const data = {
			comments: comments,
			tenantName: tenantName,
			reason: reason ? this.translateService.instant(reason) : '-',
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
