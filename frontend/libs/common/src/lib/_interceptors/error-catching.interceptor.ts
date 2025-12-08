import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ActiveToast, ToastrService } from '@windmill/ng-windmill/toastr';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, concatMap, filter, finalize, take } from 'rxjs/operators';

import { commonRoutingConstants } from '../_constants/common-routing.constants';
import { CaptchaStatus } from '../_enums/captcha.enum';
import { PersistentErrorCode } from '../_enums/persistence-error-codes.enum';
import { SilentErrorCode } from '../_enums/silent-error-codes.enum';
import { AuthService } from '../_services/auth.service';
import { CaptchaService } from '../_services/captcha.service';
import { SKIP_ERROR_TOASTER } from '../_util/http-context-token';

@Injectable()
export class ErrorCatchingInterceptor implements HttpInterceptor {
	private isRefreshingToken = false;
	private toastBackgroundMode = 'toast-light';
	private tokenRefreshedSubject = new BehaviorSubject<boolean>(false);
	private shownErrorCodes = new Set<number>();
	private activeToast: ActiveToast<unknown> | null;

	constructor(
		private readonly toastrService: ToastrService,
		private translateService: TranslateService,
		private authService: AuthService,
		private router: Router,
		private captchaService: CaptchaService,
	) {
		this.subscribeToLogout();
	}

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		return next.handle(request).pipe(
			catchError((error: HttpErrorResponse) => {
				const customErrorCode = error.error;
				const SilentErrorCodes = Object.values(SilentErrorCode);

				// If the error is silent, we don't want to show a toast
				if (SilentErrorCodes.includes(customErrorCode) || error.error instanceof Blob) {
					return throwError(() => error);
				} else if (error instanceof ErrorEvent) {
					this.showToast('generic');
				} else if (customErrorCode) {
					return this.handleCustomError(error, request, next);
				} else {
					return this.handleBackendError(error, request, next);
				}

				return throwError(() => error);
			}),
		);
	}

	private handleCustomError(
		error: HttpErrorResponse,
		request: HttpRequest<unknown>,
		next: HttpHandler,
	): Observable<HttpEvent<unknown>> {
		const customErrorCode = error.error;
		const persistentErrorCodes = Object.values(PersistentErrorCode);
		switch (customErrorCode) {
			case 40004:
				this.handleCaptcha(CaptchaStatus.INVALID_CREDENTIALS);
				break;
			case 40009:
				this.handleCaptcha(CaptchaStatus.CREATED);
				break;
			case 40017:
				return this.handleUnauthorized(request, next);
			case 40019:
				if (this.router.url === '/?reapply=true') {
					break;
				}
				this.router.navigate([commonRoutingConstants.login]);
				break;
			case 40040:
				this.router.navigate([commonRoutingConstants.dashboard]);
				break;
			default:
				break;
		}

		if (customErrorCode === PersistentErrorCode.accountAlreadyConfirmedError) {
			this.showToast(customErrorCode.toString(), false);
			return throwError(() => error);
		}

		if (persistentErrorCodes.includes(customErrorCode)) {
			if (!this.activeToast) {
				this.activeToast = this.showToast(customErrorCode.toString());
				return throwError(() => error);
			}

			this.toastrService.clear();
			this.showToast(customErrorCode.toString());

			return throwError(() => error);
		}

		if (!this.shownErrorCodes.has(customErrorCode)) {
			if (customErrorCode === 40040) {
				return throwError(() => error);
			}

			if (request.context.get(SKIP_ERROR_TOASTER)) {
				return throwError(() => error);
			}

			this.showToast(customErrorCode.toString());
			this.shownErrorCodes.add(customErrorCode);
		}

		return throwError(() => error);
	}

	private handleBackendError(
		error: HttpErrorResponse,
		request: HttpRequest<unknown>,
		next: HttpHandler,
	): Observable<HttpEvent<unknown>> {
		const status = error.status;
		switch (status) {
			case 401: {
				if (this.authService.isLoggedIn) {
					return this.handleUnauthorized(request, next);
				}
				break;
			}
			default:
				break;
		}

		this.showToast(status.toString());
		return throwError(() => error);
	}

	private handleCaptcha(status: CaptchaStatus): void {
		this.captchaService.displayCaptchaSubject.next(status);
	}

	private handleUnauthorized(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		if (this.isRefreshingToken) {
			return this.tokenRefreshedSubject.pipe(
				filter(Boolean),
				take(1),
				concatMap(() => next.handle(this.addToken(request))),
			);
		}

		this.isRefreshingToken = true;
		// Reset here so that the following requests wait until the token
		// comes back from the refreshToken call.
		this.tokenRefreshedSubject.next(false);

		return this.authService.refreshToken().pipe(
			concatMap((res: any) => {
				localStorage.setItem('JWT_TOKEN', res.accessToken);

				this.tokenRefreshedSubject.next(true);
				return next.handle(this.addToken(request));
			}),
			catchError((err) => {
				this.authService.logout();
				this.router.navigate([commonRoutingConstants.login]);
				return throwError(() => err);
			}),
			finalize(() => {
				this.isRefreshingToken = false;
			}),
		);
	}

	private addToken(req: HttpRequest<unknown>): HttpRequest<unknown> {
		const token = localStorage.getItem('JWT_TOKEN');
		return token
			? req.clone({
					setHeaders: { Authorization: 'Bearer ' + token.replace(/^"(.*)"$/, '$1') },
					withCredentials: true,
				})
			: req;
	}

	private showToast(message: string, isError = true): ActiveToast<unknown> | null {
		const toastType = isError ? 'error' : 'info';
		const toasterMessage = this.translateService.instant(`errors.${message}`);

		return this.toastrService[toastType](`<p>${toasterMessage}</p>`, '', {
			toastBackground: this.toastBackgroundMode,
			enableHtml: true,
			progressBar: true,
			tapToDismiss: true,
			timeOut: 8000,
			extendedTimeOut: 8000,
		});
	}

	private subscribeToLogout(): void {
		this.authService.logoutObservable.subscribe(() => {
			this.shownErrorCodes.delete(40019);
		});
	}
}
