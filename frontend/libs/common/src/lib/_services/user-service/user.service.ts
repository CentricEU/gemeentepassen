import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, Subject, tap } from 'rxjs';

import { CreateUserDto } from '../../_models/create-user-dto.model';
import { Environment } from '../../_models/environment.model';
import { UserDto } from '../../_models/user-dto.model';
import { UserTableDto } from '../../_models/user-table-dto.model';

@Injectable({
	providedIn: 'root',
})
export class UserService {
	public userInformationSubject = new Subject<UserDto>();
	public userInformationObservable: Observable<UserDto> = this.userInformationSubject.asObservable();

	private _userInformation: UserDto;

	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public get userInformation(): UserDto {
		return this._userInformation;
	}

	public set userInformation(value: UserDto) {
		this._userInformation = value;
	}

	public getUserInformation(userId: string): Observable<UserDto> {
		const params = new HttpParams().set('userId', userId);

		return this.httpClient.get(`${this.environment.apiPath}/users`, { params: params }).pipe(
			tap((result) => this.userInformationSubject.next(result as UserDto)),
			map((result) => {
				return result as UserDto;
			}),
		);
	}

	public countAdminUsers(): Observable<number> {
		return this.httpClient.get<number>(`${this.environment.apiPath}/users/admins/count`);
	}

	public getCashierEmailsForSupplier(supplierId: string): Observable<string[]> {
		return this.httpClient.get<string[]>(`${this.environment.apiPath}/suppliers/${supplierId}/cashiers`);
	}

	public getUsersPaged(page: number, size: number): Observable<UserTableDto[]> {
		const httpParams = new HttpParams().set('page', page).set('size', size);

		return this.httpClient.get<UserTableDto[]>(`${this.environment.apiPath}/users/admins/paginated`, {
			params: httpParams,
		});
	}

	public addUserInformation(value: UserDto): void {
		this.userInformationSubject.next(value);
	}

	public createUser(createUserDto: CreateUserDto): Observable<void> {
		return this.httpClient.post<void>(`${this.environment.apiPath}/users/create`, createUserDto);
	}
}
