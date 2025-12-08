import { DataBase } from '../dbConnection';


export async function deleteTransactionsByDiscountCodeId(id: string) 
{
	const query = `
	DELETE FROM l4l_global.offer_transaction
	WHERE discount_code_id = $1
  `;
	await DataBase.executeQuery(query, [id]);
}

