import { Component, Inject, inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
	AppType,
	CommonL4LModule,
	Environment,
	Languages,
	MobileBrowserUtil,
	MultilanguageService,
} from '@frontend/common';
import { WindmillModule } from '@frontend/common-ui';
import { TranslateModule } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';

@Component({
	selector: 'app-mobile-only',
	templateUrl: './mobile-only.component.html',
	styleUrls: ['./mobile-only.component.scss'],
	standalone: true,
	imports: [CommonL4LModule, WindmillModule, TranslateModule],
	providers: [CookieService],
})
export class MobileOnlyComponent implements OnInit {
	private readonly route = inject(ActivatedRoute);
	private readonly router = inject(Router);

	private readonly multiLanguageService = inject(MultilanguageService);

	public get isMobile(): boolean {
		return MobileBrowserUtil.isMobile();
	}

	constructor(@Inject('env') private environment: Environment) {}

	public ngOnInit(): void {
		this.setLanguageFromRoute();
	}

	public openMobileApp(): void {
		MobileBrowserUtil.openMobileApp(this.environment, 'Login');
		return;
	}

	private setLanguageFromRoute(): void {
		this.route.queryParamMap.subscribe((params) => {
			const paramValue = params.get('lang') as Languages;
			const supportedLangs = [Languages.en, Languages.nl];

			if (!paramValue || !supportedLangs.includes(paramValue)) {
				return;
			}

			this.multiLanguageService.setUsedLanguage(paramValue, AppType.citizen);
		});
	}
}
