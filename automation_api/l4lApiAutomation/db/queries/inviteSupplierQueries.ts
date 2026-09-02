import { DataBase } from '../dbConnection';

export async function deleteInvitationById(id: string): Promise<void> {
	const query = `
    DELETE FROM l4l_global.invite_supplier
    WHERE id = $1
  `;
	await DataBase.executeQuery(query, [id]);
}

export async function getInvitationsByEmail(email: string): Promise<any[]> {
	const query = `
    SELECT id, created_date, email, message, tenant_id, is_active
    FROM l4l_global.invite_supplier
    WHERE email = $1
    ORDER BY created_date DESC
  `;
	return await DataBase.executeQuery(query, [email]);
}

export async function getInvitationById(id: string): Promise<any> {
	const query = `
    SELECT id, created_date, email, message, tenant_id, is_active
    FROM l4l_global.invite_supplier
    WHERE id = $1
  `;
	const result = await DataBase.executeQuery(query, [id]);
	return result[0] || null;
}
