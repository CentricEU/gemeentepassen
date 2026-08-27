import { DataBase } from '../dbConnection';

export async function deleteDiscountCodeByOfferId(offerId: string): Promise<void> {
	const query = `
    DELETE FROM l4l_global.discount_code
    WHERE offer_id = $1
  `;
	await DataBase.executeQuery(query, [offerId]);
}
