import { Injectable } from '@angular/core';
import { BSN_KEY } from '@frontend/common';
import { Observable, ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserClaimsService {
	private bsnSubject = new ReplaySubject<string>(1);
	public bsn$: Observable<string> = this.bsnSubject.asObservable();

	public setBsn(bsn: string): void {
		localStorage.setItem(BSN_KEY, bsn);
		this.bsnSubject.next(bsn);
	}

	public getBsn(): string | null {
		return localStorage.getItem(BSN_KEY);
	}

	public loadBsnFromStorage(): void {
		const storedBsn = localStorage.getItem(BSN_KEY);
		if (storedBsn) {
			this.bsnSubject.next(storedBsn);
		}
	}
}
