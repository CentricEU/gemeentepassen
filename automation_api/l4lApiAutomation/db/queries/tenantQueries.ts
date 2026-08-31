import { TenantBankInformation } from '../../apiModels/tenantModels';
import { DataBase } from '../dbConnection';

export async function getTenantBankInformation(id: string): Promise<TenantBankInformation> {
	const query = `
    SELECT iban, bic
    FROM l4l_security.tenants
    WHERE id = $1
  `;
	const result: TenantBankInformation[] = await DataBase.executeQuery(query, [id]);
	return result[0];
}

export async function deleteTenantById(id: string): Promise<void> {
	const query = `
    DELETE FROM l4l_security.tenants 
    WHERE id = $1
  `;
	await DataBase.executeQuery(query, [id]);
}

export async function removeTenantBankInformation(id: string): Promise<void> {
  const query = `
    UPDATE l4l_security.tenants
    SET iban = NULL, bic = NULL
    WHERE id = $1
  `;
  await DataBase.executeQuery(query, [id]);
}
