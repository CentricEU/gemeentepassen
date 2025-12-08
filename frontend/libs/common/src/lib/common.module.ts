import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { AccesibilityModule } from '@innovation/accesibility';
import { CookieService } from 'ngx-cookie-service';

import { MarkAsteriskDirective } from './_directives/asterisk.directive';
import { HtmlContentValidatorDirective } from './_directives/html-input-validator.directive';
import { NumericInputDirective } from './_directives/numerical-input.directive';
import { TooltipOnEllipsisDirective } from './_directives/tooltip-on-elipsis/tooltip-on-elipsis.directive';
import { AppHttpInterceptor } from './_interceptors/app-http.interceptor';
import { ErrorCatchingInterceptor } from './_interceptors/error-catching.interceptor';
import { JwtInterceptor } from './_interceptors/jwt.interceptor';

@NgModule({
	imports: [HttpClientModule, AccesibilityModule],
	declarations: [
		MarkAsteriskDirective,
		NumericInputDirective,
		HtmlContentValidatorDirective,
		TooltipOnEllipsisDirective,
	],
	exports: [
		MarkAsteriskDirective,
		NumericInputDirective,
		HtmlContentValidatorDirective,
		AccesibilityModule,
		TooltipOnEllipsisDirective,
	],
	providers: [
		{
			provide: HTTP_INTERCEPTORS,
			useClass: JwtInterceptor,
			multi: true,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: ErrorCatchingInterceptor,
			multi: true,
		},
		{
			provide: HTTP_INTERCEPTORS,
			useClass: AppHttpInterceptor,
			multi: true,
		},
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		},
		CookieService,
	],
})
export class CommonL4LModule {}
