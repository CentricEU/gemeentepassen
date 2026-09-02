export interface InviteSupplierRequestDto {
	emails: string[];
	message: string;
}

export interface InvitationResponseDto {
	id: string;
	createdDate: string;
	email: string;
	message: string;
}
