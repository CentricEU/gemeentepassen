import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideNativeDateAdapter } from '@angular/material/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { AppHttpInterceptor, ErrorCatchingInterceptor, JwtInterceptor } from '@frontend/common';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { CentricToastrModule } from '@windmill/ng-windmill/toastr';
import { CookieService } from 'ngx-cookie-service';

import { environment } from '../environment/environment';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		// Angular core
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(appRoutes),
		importProvidersFrom(HttpClientModule),
		{ provide: HTTP_INTERCEPTORS, useClass: ErrorCatchingInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: AppHttpInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
		provideNativeDateAdapter(),
		provideAnimations(),
		// environment token
		{ provide: 'env', useValue: environment },

		// ngx-cookie-service
		CookieService,
		// ngx-translate
		importProvidersFrom(
			TranslateModule.forRoot({
				loader: {
					provide: TranslateLoader,
					useFactory: (http: HttpClient) => new TranslateHttpLoader(http, './assets/i18n/', '.json'),
					deps: [HttpClient],
				},
			}),
		),
		importProvidersFrom(CentricToastrModule.forRoot()),
	],
};
