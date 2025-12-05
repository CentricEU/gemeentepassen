import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, Subject, tap } from 'rxjs';

import { Environment } from '../_models/environment.model';
import { ProfileDropdownsDto } from '../_models/profile-dropdowns-dto.model';
import { SupplierProfile } from '../_models/supplier-profile.model';
import { SupplierProfileDto } from '../_models/supplier-profile-dto.model';

@Injectable({
	providedIn: 'root',
})
export class SupplierProfileService {
	public supplierProfileInformationSubject = new Subject<SupplierProfile>();
	public supplierProfileInformationObservable: Observable<SupplierProfile> =
		this.supplierProfileInformationSubject.asObservable();

	private _supplierProfileInformation: SupplierProfile;

	public get supplierProfileInformation(): SupplierProfile {
		return this._supplierProfileInformation;
	}

	public set supplierProfileInformation(value: SupplierProfile) {
		this._supplierProfileInformation = value;
	}

	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {}

	public getAllDropdownsData(): Observable<ProfileDropdownsDto> {
		return this.httpClient.get<ProfileDropdownsDto>(`${this.environment.apiPath}/supplier-profiles/dropdown-data`);
	}

	public updateSupplierProfile(supplierProfileDto: SupplierProfileDto): Observable<void> {
		return this.httpClient.put<void>(`${this.environment.apiPath}/supplier-profiles`, supplierProfileDto);
	}

	public getSupplierProfile(supplierId: string): Observable<SupplierProfile> {
		return this.httpClient.get<SupplierProfile>(`${this.environment.apiPath}/supplier-profiles/${supplierId}`).pipe(
			tap((result) => {
				this.supplierProfileInformation = result;
				this.supplierProfileInformationSubject.next(result as SupplierProfile);
			}),
			map((result) => {
				return result as SupplierProfile;
			}),
		);
	}
}
