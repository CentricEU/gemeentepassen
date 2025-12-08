import { CommonUtil, MonthYearEntry } from '@frontend/common';

export class GenerateInvoiceDto {
	invoiceNumber: string;
	currentDate: string;
	issueDate: string;
	dueDate: number;

	constructor(invoiceNumber: string, monthYear: MonthYearEntry, issueDate: string, dueDate: number) {
		this.invoiceNumber = invoiceNumber;
		this.currentDate = CommonUtil.getFormattedMonthDate(monthYear);
		this.issueDate = issueDate;
		this.dueDate = dueDate;
	}
}
