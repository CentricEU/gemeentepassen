import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { commonRoutingConstants, Environment, MobileBrowserUtil, ModalData } from '@frontend/common';
import { CustomDialogComponent, CustomDialogConfigUtil } from '@frontend/common-ui';
import { DialogService } from '@windmill/ng-windmill/dialog';
import { map } from 'rxjs/operators';

@Component({
	selector: 'frontend-registration-successful',
	templateUrl: './registration-successful.component.html',
	styleUrls: ['./registration-successful.component.scss'],
	standalone: false,
})
export class RegistrationSuccessfulComponent implements OnInit {
	public isCitizen: boolean;
	private readonly isMobile = MobileBrowserUtil.isMobile();

	constructor(
		private readonly dialogService: DialogService,
		private readonly router: Router,
		private readonly route: ActivatedRoute,
		@Inject('env') private environment: Environment,
	) {}

	public ngOnInit(): void {
		this.checkIfCitizen().subscribe(() => this.displaySuccessfulRegistrationDialog());
	}

	private navigateToLogin(): void {
		this.router.navigate([commonRoutingConstants.login]);
	}

	private checkIfCitizen() {
		return this.route.queryParams.pipe(
			map((params) => {
				this.isCitizen = params['is-citizen'] === 'true';
			}),
		);
	}

	private getRegistrationSuccessConfig(): MatDialogConfig {
		const modalData = this.createModalData();
		return {
			...CustomDialogConfigUtil.createMessageModal(modalData),
			disableClose: true,
		};
	}

	private createModalData(): ModalData {
		const data = {
			comments: '-',
			tenantName: '',
			reason: '',
			email: '',
		};

		const dialogContent = this.getDialogContent();
		return new ModalData(
			'register.registrationSuccessful',
			'general.success.title',
			dialogContent,
			'',
			this.shouldShowContinueLoginButton() ? 'modal.continueLogin' : '',
			true,
			'success',
			'theme',
			'verified.svg',
			data,
		);
	}

	private getDialogContent(): string {
		return this.shouldShowContinueLoginButton()
			? 'general.success.accountCreatedText'
			: 'general.success.accountCreatedTextForCitizen';
	}

	private displaySuccessfulRegistrationDialog(): void {
		const config = this.getRegistrationSuccessConfig();
		this.dialogService
			.message(CustomDialogComponent, config)
			?.afterClosed()
			.subscribe((response) => this.handleDialogClose(response));
	}

	private handleDialogClose(response: boolean): void {
		if (!response) return;

		if (this.isMobile) {
			MobileBrowserUtil.openMobileApp(this.environment, 'Login');
			return;
		}
		this.navigateToLogin();
	}

	private shouldShowContinueLoginButton(): boolean {
		return !(this.isCitizen && !this.isMobile);
	}
}
