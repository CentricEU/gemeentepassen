import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Environment } from '@frontend/common';
import { Observable } from 'rxjs';

import { CodeValidationDto } from '../../models/code-validation.model';

@Injectable({
	providedIn: 'root'
})
export class DiscountCodeService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient
	) {}

	public validateCode(codeValidation: CodeValidationDto): Observable<CodeValidationDto> {
		return this.httpClient.post<CodeValidationDto>(
			`${this.environment.apiPath}/discount-codes/validate`,
			codeValidation
		);
	}
}
