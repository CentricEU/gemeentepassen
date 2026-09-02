import { DataBase } from '../dbConnection';

export async function deleteBenefitById(id: string): Promise<void> {
	const query = `
    DELETE FROM l4l_global.benefit
    WHERE id = $1
  `;
	await DataBase.executeQuery(query, [id]);
}

export async function getBenefitById(id: string): Promise<any> {
	const query = `
    SELECT id, name, description, start_date, expiration_date, amount
    FROM l4l_global.benefit
    WHERE id = $1
  `;
	const result = await DataBase.executeQuery<{
		id: string;
		name: string;
		description: string;
		start_date: string;
		expiration_date: string;
		amount: number;
	}>(query, [id]);
	return result[0];
}
