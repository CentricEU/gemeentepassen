import { Grant } from '../../apiModels/grantModels';
import { DataBase } from '../dbConnection';
import {ConvertHelper} from '../../utils/convertHelper';

export async function getActiveGrants(): Promise<Grant[]> {
	const query = `
    SELECT 
      id, 
      title, 
      description, 
      amount, 
      create_for AS "createFor",
      TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
      TO_CHAR(expiration_date, 'YYYY-MM-DD') AS "expirationDate"
    FROM l4l_global.grants
    where expiration_date >= NOW() and tenant_id=$1
  `;

	const grants = await DataBase.executeQuery<Grant>(query, [process.env.TENANT_ID]);
  ConvertHelper.convertValueToNumber(grants, 'amount');

	return grants;
}

export async function getAllGrants(): Promise<Grant[]> {
	const query = `
    SELECT 
      id, 
      title, 
      description, 
      amount, 
      create_for AS "createFor",
      TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
      TO_CHAR(expiration_date, 'YYYY-MM-DD') AS "expirationDate"
    FROM l4l_global.grants
    WHERE tenant_id=$1
  `;
	const grants = await DataBase.executeQuery<Grant>(query, [process.env.TENANT_ID]);
  ConvertHelper.convertValueToNumber(grants, 'amount');

	return grants;
}

export async function getAllGrantsSortedByName(): Promise<Grant[]> {
	const query = `
    SELECT 
      id, 
      title, 
      description, 
      amount, 
      create_for AS "createFor",
      TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
      TO_CHAR(expiration_date, 'YYYY-MM-DD') AS "expirationDate",
      0 AS "nrBeneficiaries"
    FROM l4l_global.grants
    WHERE tenant_id=$1
    ORDER BY title ASC
  `;

	const grants = await DataBase.executeQuery<Grant>(query, [process.env.TENANT_ID]);
  ConvertHelper.convertValueToNumber(grants, 'amount');
	return grants;
}

export async function getGrantById(id: string): Promise<Grant> {
	const query = `
    SELECT 
      id, 
      title, 
      description, 
      amount, 
      create_for AS "createFor",
      TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
      TO_CHAR(expiration_date, 'YYYY-MM-DD') AS "expirationDate"
    FROM l4l_global.grants
    WHERE id = $1
  `;
	const grant = (await DataBase.executeQuery<Grant>(query, [id]))[0];
  grant.amount = Number(grant.amount);
	return grant;
}

export async function deleteGrantById(id: string): Promise<void> {
	const query = `
    DELETE FROM l4l_global.grants 
    WHERE id = $1
  `;
	await DataBase.executeQuery(query, [id]);
}
