import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		let token = localStorage.getItem('JWT_TOKEN');
		const isSignicatRequest = request.url.includes('signicat.com');

		if (isSignicatRequest) {
			return next.handle(request);
		}

		if (!token) {
			request = request.clone({
				setHeaders: {
					'Content-Type': 'application/json',
				},
				withCredentials: true,
			});
			return next.handle(request);
		}

		token = token.replace(/^"(.*)"$/, '$1');
		request = request.clone({
			setHeaders: { Authorization: `Bearer ${token}` },
			withCredentials: true,
		});

		return next.handle(request);
	}
}
