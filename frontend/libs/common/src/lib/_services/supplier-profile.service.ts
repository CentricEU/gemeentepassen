import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable, ReplaySubject, tap } from 'rxjs';

import { Environment } from '../_models/environment.model';
import { ProfileDropdownsDto } from '../_models/profile-dropdowns-dto.model';
import { SupplierProfile } from '../_models/supplier-profile.model';
import { SupplierProfilePatchDto } from '../_models/supplier-profile-patch-dto.model';

@Injectable({
	providedIn: 'root',
})
export class SupplierProfileService {
	public supplierProfileInformationSubject = new ReplaySubject<SupplierProfile>(1);
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

	public updateSupplierProfile(supplierProfileDto: SupplierProfilePatchDto): Observable<void> {
		return this.httpClient.patch<void>(`${this.environment.apiPath}/supplier-profiles`, supplierProfileDto).pipe(
			tap(() => {
				this._supplierProfileInformation = {
					...this._supplierProfileInformation,
					...supplierProfileDto,
				} as unknown as SupplierProfile;
				this.supplierProfileInformationSubject.next(this._supplierProfileInformation);
			}),
		);
	}

	public addCashiersToProfile(cashiersList: Set<string>): Observable<string[]> {
		return this.httpClient.post<string[]>(
			`${this.environment.apiPath}/supplier-profiles/cashiers`,
			Array.from(cashiersList),
		);
	}

	public reapplySupplierProfile(supplierProfileDto: SupplierProfilePatchDto): Observable<void> {
		return this.httpClient
			.patch<void>(`${this.environment.apiPath}/supplier-profiles/reapplication`, supplierProfileDto)
			.pipe(
				tap(() => {
					this._supplierProfileInformation = {
						...this._supplierProfileInformation,
						...supplierProfileDto,
					} as unknown as SupplierProfile;
					this.supplierProfileInformationSubject.next(this._supplierProfileInformation);
				}),
			);
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
