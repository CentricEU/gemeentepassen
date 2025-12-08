import { SupplierProfile } from '../../apiModels/supplierProfileModels';
import { DataBase } from '../dbConnection';

export async function getSupplierProfileById(id: string): Promise<SupplierProfile[]> {
	const query = `
    SELECT 
      company_address AS "companyBranchAddress",
      district AS "branchProvince", 
      zip_code AS "branchZip", 
      location AS "branchLocation", 
      telephone AS "branchTelephone", 
      email, 
      website, 
      account_manager AS "accountManager",
      logo AS logo, 
      owner_name AS "ownerName", 
      kvk AS "kvkNumber", 
      company_name AS "companyName", 
      admin_email "adminEmail", 
      iban, 
      bic, 
      legal_form_id AS "legalForm", 
      group_name_id AS "group", 
      category_id AS "category",
      subcategory_id AS "subcategory", 
      sp.id AS "supplierId", 
      coordinates_string AS "latlon"
    FROM l4l_security.suppliers AS sp 
    inner join l4l_security.supplier_profile AS spp on sp.profile_id=spp.id
    where sp.id=$1
      `;
	return DataBase.executeQuery<SupplierProfile>(query, [id]);
}
