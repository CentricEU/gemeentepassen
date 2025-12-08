import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { CitizenGroupDto, CitizenGroupViewDto, Environment, RequiredDocuments } from '@frontend/common';
import { Observable } from 'rxjs';
import { commonRoutingConstants } from '@frontend/common';

type StartFlowPage = typeof commonRoutingConstants.citizenGroupAssignment | typeof commonRoutingConstants.digidCategory;

@Injectable({
	providedIn: 'root',
})
export class CitizenGroupsService {
	private startFlowPage = commonRoutingConstants.digidCategory;

	public get startFlowPageValue(): StartFlowPage {
		return this.startFlowPage;
	}

	public set startFlowPageValue(value: StartFlowPage) {
		this.startFlowPage = value;
	}

	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public getCitizenGroups(): Observable<CitizenGroupViewDto[]> {
		return this.httpClient.get<CitizenGroupViewDto[]>(`${this.environment.apiPath}/citizen-groups`);
	}

	public getCitizenGroupsPaginated(page: number, size: number): Observable<CitizenGroupViewDto[]> {
		const httpParams = new HttpParams().set('page', page).set('size', size);

		return this.httpClient.get<CitizenGroupViewDto[]>(`${this.environment.apiPath}/citizen-groups/paginated`, {
			params: httpParams,
		});
	}

	public countCitizenGroups(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/citizen-groups/count`);
	}

	public saveCitizenGroup(citizenGroupDto: CitizenGroupDto): Observable<void> {
		return this.httpClient.post<void>(`${this.environment.apiPath}/citizen-groups`, citizenGroupDto);
	}

	public assignCitizenGroupToCitizen(categoryId: string): Observable<void> {
		return this.httpClient.post<void>(
			`${this.environment.apiPath}/citizen-groups/assignment?categoryId=${categoryId}`,
			{},
		);
	}

	public sendMessageForNoneCategoryFit(message: string): Observable<void> {
		return this.httpClient.post<void>(`${this.environment.apiPath}/citizen-groups/none-category-fit`, {
			message: message,
		});
	}

	public getAllRequiredDocuments(): Observable<RequiredDocuments[]> {
		return this.httpClient.get<RequiredDocuments[]>(`${this.environment.apiPath}/citizen-groups//documents`);
	}

	public getRequiredDocumentsForCitizenGroup(): Observable<RequiredDocuments[]> {
		return this.httpClient.get<RequiredDocuments[]>(`${this.environment.apiPath}/citizen-groups/documents`);
	}
}
