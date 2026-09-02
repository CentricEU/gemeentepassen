import { DataBase } from '../dbConnection';
import * as userQueries from './userQueries';

export async function getUserIdByPassholderId(passholderId: string): Promise<string> {
	const query = `
    SELECT user_id
    FROM l4l_global.passholders
    WHERE id = $1
  `;
	const result = await DataBase.executeQuery<{ user_id: string }>(query, [passholderId]);
	return result[0]?.user_id;
}

export async function deletePassholderById(id: string): Promise<void> {
	const userId = await getUserIdByPassholderId(id);

	const query = `
    DELETE FROM l4l_global.passholders 
    WHERE id = $1
  `;
	await DataBase.executeQuery(query, [id]);

	await userQueries.removeUserById(userId);
}

export async function getPassholdersIdByName(batchId?: number): Promise<string[]> {
	if (batchId !== undefined) {
		const query = `
      SELECT id
      FROM l4l_global.passholders
      WHERE name = $1 OR name = $2
    `;
		const result: string[] = (
			await DataBase.executeQuery<{ id: string }>(query, [`${batchId}_AUT995`, `${batchId + 1}_AUT995`])
		).map((r) => r.id);
		return result;
	}

	const query = `
    SELECT id
    FROM l4l_global.passholders
    WHERE name like '%AUT995'
  `;
	const result: string[] = (await DataBase.executeQuery<{ id: string }>(query)).map((r) => r.id);
	return result;
}

export async function getPassNumberById(id: string): Promise<string> {
	const query = `
    SELECT pass_number
    FROM l4l_global.passholders
    WHERE id = $1
  `;
	const result = await DataBase.executeQuery<{ pass_number: string }>(query, [id]);
	return result[0]?.pass_number;
}
