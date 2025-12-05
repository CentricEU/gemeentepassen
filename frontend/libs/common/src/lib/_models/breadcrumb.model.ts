export class Breadcrumb {
	translationLabel: string;
	routerLink?: string[];
	queryParams?: string[];

	constructor(translationLabel: string, routerLink?: string[], queryParams?: string[]) {
		this.routerLink = routerLink;
		this.translationLabel = translationLabel;
		this.queryParams = queryParams;
	}
}
