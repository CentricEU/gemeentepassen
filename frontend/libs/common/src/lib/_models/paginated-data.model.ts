import { Page } from './page.model';

export class PaginatedData<T> {
	public pages: Page<T>[];
	public pageSize: number;
	public currentIndex: number;

	constructor(pages: Page<T>[], pageSize: number, currentIndex: number) {
		this.pages = pages;
		this.pageSize = pageSize;
		this.currentIndex = currentIndex;
	}
}
