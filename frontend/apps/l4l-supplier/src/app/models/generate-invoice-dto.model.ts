export class GenerateInvoiceDto {
	invoiceNumber: string;
	currentDate: string;
	issueDate: string;
	dueDate: number;

	constructor(invoiceNumber: string, currentDate: string, issueDate: string, dueDate: number) {
		this.invoiceNumber = invoiceNumber;
		this.currentDate = this.getFormattedMonthDate(currentDate);
		this.issueDate = issueDate;
		this.dueDate = dueDate;
	}

	private getFormattedMonthDate(monthValue: string): string {
		const date = new Date(monthValue);
		return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
	}
}
