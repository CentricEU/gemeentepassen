export class ModalData {
	title: string;
	mainContent: string;
	secondaryContent: string;
	cancelButtonText: string;
	acceptButtonText: string;
	disableClosing: boolean;
	tooltipColor: string;
	modalTypeClass?: string;
	fileName?: string;
	optionalText?: {
		comments: string;
		tenantName: string;
		reason: string;
		email: string;
		offerName?: string;
	};

	constructor(
		title: string,
		mainContent: string,
		secondaryContent: string,
		cancelButtonText: string,
		acceptButtonText: string,
		disableClosing: boolean,
		modalTypeClass: string,
		tooltipColor: string,
		fileName?: string,
		optionalText?: {
			comments: string;
			reason: string;
			tenantName: string;
			email: string;
			offerName?: string;
		},
	) {
		this.title = title;
		this.mainContent = mainContent;
		this.secondaryContent = secondaryContent;
		this.cancelButtonText = cancelButtonText;
		this.acceptButtonText = acceptButtonText;
		this.disableClosing = disableClosing;
		this.fileName = fileName;
		this.optionalText = optionalText;
		this.modalTypeClass = modalTypeClass;
		this.tooltipColor = tooltipColor;
	}
}
