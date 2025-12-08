import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { RejectionReason } from '../../_enums/rejection-reason.enum';
import { Environment } from '../../_models/environment.model';
import { RejectSupplierDto } from '../../_models/reject-supplier-dto.model';

@Injectable({
	providedIn: 'root',
})
export class SupplierRejectionService {
	private rejectionReasonMap: Record<string, string> = {};

	private rejectionReasons = [
		{ key: 'rejectSupplier.reasons.notInRegion', value: RejectionReason.NOT_IN_REGION },
		{ key: 'rejectSupplier.reasons.misbehavior', value: RejectionReason.MISBEHAVIOR },
		{ key: 'rejectSupplier.reasons.idle', value: RejectionReason.IDLE },
		{ key: 'rejectSupplier.reasons.incompleteInformation', value: RejectionReason.INCOMPLETE_INFORMATION },
		{ key: 'rejectSupplier.reasons.duplicate', value: RejectionReason.DUPLICATE },
	];

	public get rejectionReasonValues(): { key: string; value: RejectionReason }[] {
		return this.rejectionReasons;
	}

	constructor(
		@Inject('env') private environment: Environment,
		private httpClient: HttpClient,
	) {
		this.parseRejectionReasons();
	}

	public getSupplierRejectionInformation(
		supplierId: string,
	): Observable<RejectSupplierDto & { reasonLabel: string }> {
		return this.httpClient
			.get<RejectSupplierDto>(`${this.environment.apiPath}/suppliers/rejection/${supplierId}`)
			.pipe(
				map((dto) => ({
					...dto,
					reasonLabel: this.getRejectionReasonLabel(dto.reason.toString()),
				})),
			);
	}

	public rejectSupplier(rejectSupplierDto: RejectSupplierDto): Observable<void> {
		return this.httpClient.post<void>(`${this.environment.apiPath}/suppliers/reject`, rejectSupplierDto);
	}

	private parseRejectionReasons(): void {
		this.rejectionReasons.forEach((reason) => {
			this.rejectionReasonMap[reason.value] = reason.key;
		});
	}

	private getRejectionReasonLabel(value: string | RejectionReason): string {
		return this.rejectionReasonMap[value.toString()] || '';
	}
}
