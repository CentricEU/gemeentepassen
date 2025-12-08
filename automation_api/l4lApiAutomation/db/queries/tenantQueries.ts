import { Tenant } from '../../apiModels/tenantModels';
import { DataBase } from '../dbConnection';
import { ConvertHelper } from '../../utils/convertHelper';

export async function getTenantById(id: string): Promise<Tenant> {
	const query = `
    SELECT 
      id, 
      name, 
      address,
      iban,
      bic, 
      wage,
      TO_CHAR(created_date, 'YYYY-MM-DD"T"HH24:MI:SS.US')  AS "createdDate"
    FROM l4l_security.tenants 
    WHERE id = $1
  `;
  const result = await DataBase.executeQuery<Tenant>(query, [id]);
  ConvertHelper.convertValueToNumber(result, 'wage');
  return result[0];
}
export async function getAllTenants(): Promise<Tenant[]> {
	const query = `
    SELECT 
      id, 
      name, 
      address, 
      iban,
      bic,
      wage,
      TO_CHAR(created_date, 'YYYY-MM-DD"T"HH24:MI:SS.US')  AS "createdDate"
    FROM l4l_security.tenants
  `;

  const result = await DataBase.executeQuery<Tenant>(query);
  ConvertHelper.convertValueToNumber(result, 'wage');
  return result;
}

export async function deleteTenantById(id: string): Promise<void> {
	const query = `
    DELETE FROM l4l_security.tenants 
    WHERE id = $1
  `;
	await DataBase.executeQuery(query, [id]);
}
