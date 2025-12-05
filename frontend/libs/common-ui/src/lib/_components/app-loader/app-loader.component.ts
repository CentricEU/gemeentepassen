import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { AppLoaderService } from '@frontend/common';
import { Subscription } from 'rxjs';

@Component({
	selector: 'frontend-app-loader',
	templateUrl: './app-loader.component.html',
	styleUrls: ['./app-loader.component.scss'],
})
export class AppLoaderComponent implements OnInit, OnDestroy {
	public show = false;
	private subscription: Subscription;

	constructor(
		private appLoaderService: AppLoaderService,
		private cdr: ChangeDetectorRef,
	) {}

	public ngOnInit() {
		this.subscription = this.appLoaderService.loaderStateObservable$.subscribe((state: boolean) => {
			this.show = state;
			this.cdr.detectChanges();
		});
	}

	public ngOnDestroy() {
		this.subscription?.unsubscribe();
	}
}
