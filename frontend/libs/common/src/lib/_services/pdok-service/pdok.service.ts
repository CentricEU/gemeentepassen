import { HttpBackend, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class PdokService {
	private httpClient: HttpClient;
	private baseURL = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1';

	constructor(handler: HttpBackend) {
		this.httpClient = new HttpClient(handler);
	}

	public getCoordinateFromAddress(city: string, postalCode: string) {
		return this.httpClient
			.get(`${this.baseURL}/free?q=${city} ${postalCode}&fl=centroide_ll&start=0&rows=1`)
			.pipe(map((result) => result as any));
	}
}
