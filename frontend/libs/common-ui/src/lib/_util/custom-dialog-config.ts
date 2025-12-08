import { MatDialogConfig } from '@angular/material/dialog';
import { ModalData } from '@frontend/common';

export class CustomDialogConfigUtil {
	static MESSAGE_MODAL_CONFIG: MatDialogConfig = {
		width: '600px',
		disableClose: false,
		autoFocus: true,
		data: {
			title: '',
			mainContent: '',
			secondaryContent: '',
			disableClosing: true,
			cancelButtonType: 'ghost-greyscale',
			cancelButtonText: '',
			acceptButtonType: 'high-emphasis-success',
			acceptButtonText: '',
			modalTypeClass: '',
			fileName: '',
			optionalText: {
				reason: '',
				comments: '',
				tenantName: '',
			},
			comments: '',
		},
	};

	public static createMessageModal(successModal: ModalData): MatDialogConfig {
		const config: MatDialogConfig = structuredClone(this.MESSAGE_MODAL_CONFIG);
		config.data.title = successModal.title;
		config.data.mainContent = successModal.mainContent;
		config.data.secondaryContent = successModal.secondaryContent;
		config.data.cancelButtonText = successModal.cancelButtonText;
		config.data.acceptButtonText = successModal.acceptButtonText;
		config.data.disableClosing = successModal.disableClosing;
		config.data.fileName = successModal.fileName;
		config.data.optionalText = successModal.optionalText;
		config.data.modalTypeClass = successModal.modalTypeClass;
		config.data.tooltipColor = successModal.tooltipColor;
		this.getAcceptedButtonType(successModal.modalTypeClass, config);
		return config;
	}

	private static getAcceptedButtonType(modalTypeClass: string | undefined, config: MatDialogConfig): void {
		if (modalTypeClass === 'warning' || modalTypeClass === 'danger') {
			config.data.acceptButtonType = `high-emphasis-${modalTypeClass}`;
		}
	}
}
