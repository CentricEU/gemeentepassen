import { DataBase } from '../dbConnection';

export async function deleteCitizenGroupById(id: string): Promise<void> {
	const query = `
    DELETE FROM l4l_global.citizen_group
    WHERE id = $1
  `;
	await DataBase.executeQuery(query, [id]);
}

export async function getCitizenGroupByName(name: string): Promise<any> {
	const query = `
    SELECT id, group_name, age_group, includes_dependent_children, threshold_amount, max_income
    FROM l4l_global.citizen_group
    WHERE group_name = $1
  `;
	const result = await DataBase.executeQuery<{
		id: string;
		group_name: string;
		age_group: string[];
		includes_dependent_children: boolean;
		threshold_amount: number;
		max_income: number;
	}>(query, [name]);
	return result[0];
}
