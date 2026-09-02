import { DataBase } from '../dbConnection';

export async function deleteTransactionsByDiscountCode(id: string) {
	const getDiscountCodeIdQuery = `
	SELECT id
	FROM l4l_global.discount_code
	WHERE code = $1
	`;
	const result = await DataBase.executeQuery<{ id: string }>(getDiscountCodeIdQuery, [id]);

	if (result.length === 0) {
		throw new Error(`No discount code found with code: ${id}`);
	}

	const discountCodeId = result[0].id;
	const queryRemove = `
	DELETE FROM l4l_global.offer_transaction
	WHERE discount_code_id = $1
  `;
	await DataBase.executeQuery(queryRemove, [discountCodeId]);
}
