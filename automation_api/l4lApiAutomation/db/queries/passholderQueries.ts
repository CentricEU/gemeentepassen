import { Passholder } from '../../apiModels/passholderModels';
import { Grant } from '../../apiModels/grantModels';
import { Tenant } from '../../apiModels/tenantModels';
import { DataBase } from '../dbConnection';
import { ConvertHelper } from '../../utils/convertHelper';

export async function getPassholders(id?: string): Promise<Passholder[]> {
	const queryPassholders = `
    SELECT 
        id,
        name,
        TO_CHAR(expiring_date, 'YYYY-MM-DD') AS "expiringDate",
        pass_number AS "passNumber",
        residence_city AS "residenceCity",
        address,
        bsn,
        CASE 
            WHEN user_id IS NOT NULL THEN true
            ELSE false
        END AS "isRegistered"
    FROM l4l_global.passholders
        WHERE tenant_id = $1 ${id ? ' AND id = $2' : ''}
        ORDER BY name ASC
      `;
      
	const queryGrants = `
      SELECT 
        id,
        title,
        description,
        amount,
        create_for AS "createFor",
        TO_CHAR(created_date, 'YYYY-MM-DD"T"HH24:MI:SS.US') AS "createdDate",
        TO_CHAR(start_date, 'YYYY-MM-DD') AS "startDate",
        TO_CHAR(expiration_date, 'YYYY-MM-DD') AS "expirationDate" 
    FROM l4l_global.passholders_grants AS pg
    INNER JOIN l4l_global.grants AS g on pg.grant_id=g.id
    WHERE passholder_id = $1
    ORDER BY title ASC
      `;

	const tenantQuery = `
  SELECT 
        t.id, 
        t.name, 
        t.address, 
        TO_CHAR(t.created_date, 'YYYY-MM-DD"T"HH24:MI:SS.US') AS "createdDate",
        t.iban, 
        t.bic,
        t.wage
    FROM l4l_global.grants AS g
    INNER JOIN l4l_security.tenants AS t ON g.tenant_id=t.id
    WHERE g.id = $1
  `;
	let passholders: Passholder[] = [];

	if (id) {
		passholders = await DataBase.executeQuery(queryPassholders, [process.env.TENANT_ID, id]);
	} else {
		passholders = await DataBase.executeQuery(queryPassholders, [process.env.TENANT_ID]);
	}

	for (const passholder of passholders) {
		const grants: Grant[] = await DataBase.executeQuery(queryGrants, [passholder.id]);

		for (const grant of grants) {
			const tenant: Tenant[] = await DataBase.executeQuery(tenantQuery, [grant.id]);
      ConvertHelper.convertValueToNumber(tenant, 'wage');
			grant.tenant = tenant[0];
			grant.amount = Number(grant.amount);
		}
		passholder.grants = grants;
	}

	return passholders;
}

export async function getPassholdersById(id: string[]): Promise<Passholder[]> {
	const queryPassholders = `
    SELECT 
        id,
        name,
        TO_CHAR(expiring_date, 'YYYY-MM-DD') AS "expiringDate",
        TO_CHAR(created_date, 'YYYY-MM-DD"T"HH24:MI:SS.US') AS "createdDate",
        pass_number AS "passNumber",
        residence_city AS "residenceCity",
        address,
        bsn,
        user_id AS user,
        null AS grants
    FROM l4l_global.passholders
        WHERE id in ('${id.join("','")}')
      `;

	const tenantQuery = `
      SELECT 
        t.id, 
        t.name, 
        t.address, 
        TO_CHAR(t.created_date, 'YYYY-MM-DD"T"HH24:MI:SS.US') AS "createdDate",
        t.iban, 
        t.bic,
        t.wage
        FROM l4l_security.tenants AS t
        INNER JOIN l4l_global.passholders AS p ON p.tenant_id=t.id
        WHERE p.id = $1
      `;
	let passholders: Passholder[] = await DataBase.executeQuery(queryPassholders);

	for (const passholder of passholders) {
		const tenant: Tenant[] = await DataBase.executeQuery(tenantQuery, [passholder.id]);
    ConvertHelper.convertValueToNumber(tenant, 'wage');
		passholder.tenant = tenant[0];
	}

	return passholders;
}

export async function deletePassholderById(id: string): Promise<void> {
	const query = `
    DELETE FROM l4l_global.passholders 
    WHERE id = $1
  `;
	await DataBase.executeQuery(query, [id]);
}
