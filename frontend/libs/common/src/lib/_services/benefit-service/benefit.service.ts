import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BenefitDto } from '../../_models/benefit-dto.model';
import { EligibleBenefitDto } from '../../_models/eligible-benefit-dto.model';
import { Environment } from '../../_models/environment.model';
import { BenefitTableDto } from '../../_models/benefit-table-dto.model';

@Injectable({
	providedIn: 'root',
})
export class BenefitService {
	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public createBenefit(benefitCreateDto: BenefitDto): Observable<void> {
		return this.httpClient.post<void>(`${this.environment.apiPath}/benefits`, benefitCreateDto);
	}

	public getAllBenefitsForCitizenGroup(): Observable<EligibleBenefitDto[]> {
		return this.httpClient.get<EligibleBenefitDto[]>(`${this.environment.apiPath}/benefits`);
	}

	public getAllBenefits(): Observable<BenefitDto[]> {
		return this.httpClient.get<BenefitDto[]>(`${this.environment.apiPath}/benefits/all`);
	}

	public countBenefits(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/benefits/count`);
	}

	public getAllBenefitsPaged(page: number, size: number): Observable<BenefitTableDto[]> {
		const httpParams = new HttpParams().set('page', page).set('size', size);

		return this.httpClient.get<BenefitTableDto[]>(`${this.environment.apiPath}/benefits/paginated`, {
			params: httpParams,
		});
	}
}
