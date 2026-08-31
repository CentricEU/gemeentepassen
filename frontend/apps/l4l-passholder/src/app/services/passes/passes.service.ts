import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment } from '@frontend/common';
import { Observable } from 'rxjs';

import { PassDto } from '../../shared/models/pass-dto.model';

@Injectable({
	providedIn: 'root',
})
export class PassesService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public savePass(passDto: PassDto, files: File[]): Observable<void> {
		return this.httpClient.post<void>(`${this.environment.apiPath}/passes`, this.getPassFormData(passDto, files));
	}

	private getPassFormData(passDto: PassDto, files: File[]): FormData {
		const formData: FormData = new FormData();

		formData.append(
			'passDto',
			new Blob([JSON.stringify(passDto)], {
				type: 'application/json',
			}),
		);

		files.forEach((file) => {
			formData.append('files', file, file.name);
		});

		return formData;
	}
}
