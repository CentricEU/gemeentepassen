export interface SetupPasswordDTO {
	token: string;
	username: string;
	password: string;
}

export interface ChangePasswordDTO {
	token: string;
	password: string;
}

export interface SetupPasswordValidateDTO {
	token: string;
	username: string;
}

export interface RegisterCitizenUserDto {
	firstName: string;
	lastName: string;
	email: string;
	passNumber: string;
	password: string;
	retypedPassword: string;
}

export interface CitizenViewDto {
	email: string;
	firstName: string;
	lastName: string;
	isActive: boolean;
}

export interface RecoverPasswordDTO {
	email: string;
	reCaptchaResponse: string;
	role: string;
}

export interface AccountDeletionReasonsDto {
	accountDeletionReasons: string[];
}

export interface CreateUserDto {
	firstName: string;
	lastName: string;
	email: string;
}

export interface UserProfileDto {
	firstName: string;
	lastName: string;
	address?: string;
	telephone?: string;
}

export interface UserViewDto {
	companyName?: string;
	kvkNumber?: string;
	email?: string;
	status?: 'CREATED' | 'PENDING' | 'APPROVED' | 'REJECTED';
	isProfileSet?: boolean;
	isApproved?: boolean;
	supplierId?: string;
	firstName?: string;
	lastName?: string;
}

export interface UserTableDto {
	id: string;
	fullName: string;
	email: string;
	createdDate: string;
}

export interface CitizenCompleteProfile{
	email: string;
	firstName: string;
	lastName: string;
	address: string;
	telephone: string;
}
