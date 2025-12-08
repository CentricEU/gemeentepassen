import { DataBase } from '../dbConnection';

export async function getUserById(id: string): Promise<any[]> {
	const query = `
    SELECT 
      s.company_name AS "companyName", 
      s.kvk AS "kvkNumber", 
      u.username AS "email", 
      s.status, 
      s.is_profile_set AS "isProfileSet", 
      u.is_approved AS "isApproved", 
      u.supplier_id AS "supplierId",
	    first_name AS "firstName"

    FROM l4l_security.suppliers AS s 
    INNER JOIN l4l_security.user AS u ON u.supplier_id = s.id 
    WHERE u.id = $1
  `;
	return DataBase.executeQuery(query, [id]);
}