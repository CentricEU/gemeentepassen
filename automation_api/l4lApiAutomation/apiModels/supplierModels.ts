export interface RegisterSupplierRequestDto {
	firstName: string;
	lastName: string;
	companyName: string;
	kvk: string;
	tenantId: string;
	email: string;
	password: string;
	retypedPassword: string;
	agreedTerms: boolean;
}

export interface RegisterSupplierResponseDto {
	id: string;
	companyName: string;
	kvk: string;
	createdDate: string;
	status: 'CREATED' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface RejectSupplier {
	reason: 'NOT_IN_REGION' | 'MISBEHAVIOR' | 'IDLE' | 'INCOMPLETE_INFORMATION' | 'DUPLICATE';
	comments?: string;
	supplierId: string;
}
