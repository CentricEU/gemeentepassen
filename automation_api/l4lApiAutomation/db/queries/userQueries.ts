import { CitizenCompleteProfile, CitizenViewDto } from '../../apiModels/userModels';
import { DataBase } from '../dbConnection';

export async function getUserById(id: string): Promise<any> {
	const query = `SELECT 
		username as "email", 
		last_name as "lastName", 
		first_name as "firstName" ,
		is_active as "isActive"
	FROM l4l_security.user 
	WHERE id = $1`;
	const result = await DataBase.executeQuery(query, [id]);
	return result[0];
}

export function getUserIdByEmail(email: string): Promise<string> {
	const query = 'SELECT id FROM l4l_security.user WHERE username = $1';
	return DataBase.executeQuery<{ id: string }>(query, [email]).then((result) => result[0]?.id);
}

export async function deleteUserById(id: string): Promise<void> {
	const query = 'DELETE FROM l4l_security.user WHERE id = $1';
	await DataBase.executeQuery(query, [id]);
}

export async function getUserByEmail(email: string): Promise<any> {
	const query = `SELECT 
		username as "email", 
		last_name as "lastName", 
		first_name as "firstName" ,
		is_active as "isActive"
	FROM l4l_security.user 
	WHERE username = $1`;
	const result = await DataBase.executeQuery(query, [email]);
	return result[0];
}

export async function getUserByUsername(username: string): Promise<any> {
	const query = 'SELECT * FROM l4l_security.user WHERE username = $1';
	const result = await DataBase.executeQuery(query, [username]);
	return result[0];
}

export async function setIsApprovedUser(userId: string, isApproved: boolean): Promise<void> {
	const query = 'UPDATE l4l_security.user SET is_approved = $1 WHERE id = $2';
	await DataBase.executeQuery(query, [isApproved, userId]);
}

export async function getIsApprovedUser(userId: string): Promise<boolean> {
	const query = 'SELECT is_approved FROM l4l_security.user WHERE id = $1';
	const result = await DataBase.executeQuery<{ is_approved: boolean }>(query, [userId]);
	return result[0]?.is_approved || false;
}

export async function enableUser(userId: string): Promise<void> {
	const query = 'UPDATE l4l_security.user SET is_enabled = true WHERE id = $1';
	await DataBase.executeQuery(query, [userId]);
}

export async function removeUserByEmail(email: string): Promise<void> {
	const id = await getUserIdByEmail(email);
	if (!id) {
		console.warn(`No user found with email ${email} to delete.`);
		return;
	}

	const queryUserRoles = 'DELETE FROM l4l_security.user_role WHERE user_id = $1';
	await DataBase.executeQuery(queryUserRoles, [id]);

	const query = 'DELETE FROM l4l_security.user WHERE id = $1';
	await DataBase.executeQuery(query, [id]);
}

export async function removeUserById(id: string): Promise<void> {
	const queryUserRoles = 'DELETE FROM l4l_security.user_role WHERE user_id = $1';
	await DataBase.executeQuery(queryUserRoles, [id]);

	const query = 'DELETE FROM l4l_security.user WHERE id = $1';
	await DataBase.executeQuery(query, [id]);
}

export async function getVerificationTokenByUserId(userId: string): Promise<string> {
	const query = 'SELECT token FROM l4l_security.verification_token WHERE user_id = $1';
	const result = await DataBase.executeQuery<{ token: string }>(query, [userId]);
	return result[0]?.token;
}

export async function getSetupPasswordTokenByEmail(email: string): Promise<string> {
	const query = 'SELECT password FROM l4l_security.user WHERE username = $1';
	const result = await DataBase.executeQuery<{ password: string }>(query, [email]);
	return result[0]?.password;
}

export async function getAdminsByTenantId(): Promise<CitizenViewDto[]> {
	const query = `
	SELECT username as "email",
		first_name as "firstName",
		last_name as "lastName",
		is_enabled as "isEnabled"
	FROM l4l_security.user
	where tenant_id = $1 and id !=$2
	`;
	const result = await DataBase.executeQuery<CitizenViewDto>(query, [
		process.env.TENANT_ID,
		process.env.USER_MUNICIPALITY_ID
	]);
	const returnedAdmins: CitizenViewDto[] = [];
	result.forEach((item) => {
		returnedAdmins.push(item);
	});
	return returnedAdmins;
}

export async function getCitizenAllDetailsByEmail(email: string): Promise<CitizenCompleteProfile> {
	const query = `SELECT 
		username as "email",
		first_name as "firstName",
		last_name as "lastName",
		address as "address",
		telephone as "telephone"
	FROM l4l_security.user as u
	INNER JOIN l4l_security.user_profile as up ON u.id=up.id
	WHERE u.username = $1`;
	const result = await DataBase.executeQuery<CitizenCompleteProfile>(query, [email]);
	return result[0];
}

export async function isAccountConfirmed(userId: string): Promise<boolean> {
	const query = 'SELECT is_enabled FROM l4l_security.user WHERE id = $1';
	const result = await DataBase.executeQuery<{ is_enabled: boolean }>(query, [userId]);
	return result[0]?.is_enabled || false;
}
