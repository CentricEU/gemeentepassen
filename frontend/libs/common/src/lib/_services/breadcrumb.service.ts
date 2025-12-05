import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { Breadcrumb } from '../_models/breadcrumb.model';

@Injectable({
	providedIn: 'root',
})
export class BreadcrumbService {
	private breadcrumbsChanged: Subject<Breadcrumb[]> = new Subject<Breadcrumb[]>();
	public breadcrumbsChangedObservable: Observable<Breadcrumb[]> = this.breadcrumbsChanged.asObservable();

	public breadcrumbs: Breadcrumb[] = [new Breadcrumb('general.home', ['/'])];

	public setBreadcrumbs(breadcrumbs: Breadcrumb[]): void {
		this.breadcrumbs = [...breadcrumbs];
		this.breadcrumbsChanged.next(this.breadcrumbs);
	}

	public removeBreadcrumbs(): void {
		this.setBreadcrumbs([]);
	}
}
