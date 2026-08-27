import { SupplierProfilePatchDto } from '../../apiModels/supplierProfileModels';
import { DataBase } from '../dbConnection';

export async function getSupplierById(id: string): Promise<any> {
	const query = `
		SELECT id, company_name, kvk, created_date, tenant_id, status, is_profile_set, is_reviewed, status_update, admin_email, profile_id
		FROM l4l_security.suppliers
		WHERE id = $1
	`;
	const result = await DataBase.executeQuery(query, [id]);
	return result[0] || null;
}

export async function getSupplierProfileIdBySupplierId(supplierId: string): Promise<SupplierProfilePatchDto> {
	const query = `SELECT 
   spp.logo,
    spp.owner_name AS "ownerName",
    spp.legal_form_id AS "legalForm",
    spp.group_name_id AS "group",
    spp.category_id AS "category",
    spp.subcategory_id AS "subcategory",
    spp.iban,
    spp.bic,
    spp.company_address AS "companyBranchAddress",
    spp.district AS "branchProvince",
    spp.zip_code AS "branchZip",
    spp.location AS "branchLocation",
    spp.telephone AS "branchTelephone",
    spp.email,
    spp.website,
    spp.account_manager AS "accountManager",
    spp.supplier_id AS "supplierId",
    spp.coordinates_string AS "latlon"
FROM l4l_security.suppliers AS sp
INNER JOIN l4l_security.supplier_profile AS spp ON sp.profile_id = spp.id
WHERE sp.id = $1;
	`;
	const result = await DataBase.executeQuery<SupplierProfilePatchDto>(query, [supplierId]);
	return result[0];
}

export async function getCashierBySupplierId(supplierId: string): Promise<string[]> {
	var returnedCashiers: string[] = [];
	const query = `
SELECT us.username FROM l4l_security."user" AS us
INNER JOIN l4l_security.user_role AS ur ON us.id = ur.user_id
WHERE us.supplier_id = $1 AND ur.role_id = 3`;
	const data: any = await DataBase.executeQuery<string>(query, [supplierId]);
	data.forEach((item: any) => {
		returnedCashiers.push(item.username);
	});
	return returnedCashiers;
}

export async function deleteSupplierById(id: string): Promise<void> {
	const supplierResult: any = await DataBase.executeQuery(
		`SELECT profile_id FROM l4l_security.suppliers WHERE id = $1`,
		[id]
	);
	const profileId = supplierResult[0]?.profile_id || null;

	const userIdsResult = await DataBase.executeQuery(`SELECT id FROM l4l_security."user" WHERE supplier_id = $1`, [
		id
	]);
	const userIds = userIdsResult.map((row: any) => row.id);

	await DataBase.executeQuery(`DELETE FROM l4l_global.supplier_rejection WHERE supplier_id = $1`, [id]);

	await DataBase.executeQuery(`DELETE FROM l4l_security.user_role WHERE user_id = ANY($1::uuid[])`, [userIds]);

	await DataBase.executeQuery(`DELETE FROM l4l_security."user" WHERE supplier_id = $1`, [id]);

	await DataBase.executeQuery(`DELETE FROM l4l_global.working_hours WHERE supplier_id = $1`, [id]);

	await DataBase.executeQuery(`DELETE FROM l4l_security.suppliers WHERE id = $1`, [id]);

	if (profileId) {
		await DataBase.executeQuery(`DELETE FROM l4l_security.supplier_profile WHERE id = $1`, [profileId]);
	}
}

export async function getSupplierByKvk(kvk: string): Promise<any> {
	const query = `
		SELECT id, company_name as "companyName", kvk, created_date, tenant_id, status, is_profile_set, is_reviewed, status_update, admin_email, profile_id
		FROM l4l_security.suppliers
		WHERE kvk = $1
	`;
	const result = await DataBase.executeQuery(query, [kvk]);
	return result[0] || null;
}

export async function getSupplierRejectionBySupplierId(supplierId: string): Promise<any> {
	const query = `
		SELECT id, reason, comments, supplier_id
		FROM l4l_global.supplier_rejection
		WHERE supplier_id = $1
	`;
	const result = await DataBase.executeQuery(query, [supplierId]);
	return result[0] || null;
}
