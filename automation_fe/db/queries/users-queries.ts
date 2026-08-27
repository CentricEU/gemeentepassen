import { DataBase } from "../db-connection";

export async function deleteDbUserByUserName(username: string): Promise<any> {
    const query = `
        WITH deleted_roles AS (
            DELETE FROM l4l_security.user_role ur
            USING l4l_security."user" u
            WHERE ur.user_id = u.id
              AND u.username = $1
        )
        DELETE FROM l4l_security."user"
        WHERE username = $1;
    `;
    const params = [username];
    return await DataBase.executeQuery(query, params);
}