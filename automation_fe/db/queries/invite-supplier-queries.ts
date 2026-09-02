import { DataBase } from "../db-connection";

export async function deleteDbInviteSupplierByEmail(email: string): Promise<any> {
    const query = `
        DELETE FROM l4l_global.invite_supplier    
        WHERE email = $1
    `;
    const values = [email];
    return DataBase.executeQuery(query, values);
}