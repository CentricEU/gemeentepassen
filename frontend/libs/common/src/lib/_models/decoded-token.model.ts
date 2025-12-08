import { RoleDto } from './role.model';

export class DecodedToken {
	exp: number;
	iat: number;
	role: RoleDto;
	sub: string;
	userId: string;
	username: string;
	tenantId: string;
	supplierId: string;
}
