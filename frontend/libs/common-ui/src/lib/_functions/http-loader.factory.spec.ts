import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HttpLoaderFactory } from './htpp-loader.factory';

describe('HttpLoaderFactory', () => {
	let httpClient: HttpClient;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
		});

		httpClient = TestBed.inject(HttpClient);
	});

	it('should create an instance of TranslateHttpLoader', () => {
		const factory = HttpLoaderFactory(httpClient);

		expect(factory instanceof TranslateHttpLoader).toBeTruthy();
	});
});
