import { DataBase } from '../dbConnection';

export async function getOfferTypesCount(): Promise<number> {
	const query = `
    SELECT COUNT(*) as count
    FROM l4l_global.offer_type
  `;
	const result = await DataBase.executeQuery<{ count: string }>(query, []);
	return parseInt(result[0].count);
}

export async function getOfferTransactionsCount(): Promise<number> {
	const query = `
    SELECT COUNT(*) as count
    FROM l4l_global.offer_transaction
  `;
	const result = await DataBase.executeQuery<{ count: string }>(query, []);
	return parseInt(result[0].count);
}

export async function getPassholdersCount(): Promise<number> {
	const query = `
    SELECT COUNT(*) as count
    FROM l4l_global.passholders
  `;
	const result = await DataBase.executeQuery<{ count: string }>(query, []);
	return parseInt(result[0].count);
}

export async function getSuppliersCount(): Promise<number> {
	const query = `
    SELECT COUNT(*) as count
    FROM l4l_security.suppliers
    WHERE status IN ('CREATED', 'PENDING', 'APPROVED', 'REJECTED')
  `;
	const result = await DataBase.executeQuery<{ count: string }>(query, []);
	return parseInt(result[0].count);
}
