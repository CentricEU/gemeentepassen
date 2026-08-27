import { Client } from "pg";
import { getRequiredEnvVar } from "../utils/test-utils";

export class DataBase {
  private static DBConfig = {
    host: getRequiredEnvVar("DB_HOST"),
    database: getRequiredEnvVar("DB_NAME"),
    user: getRequiredEnvVar("DB_USER"),
    password: getRequiredEnvVar("DB_PASS"),
    port: 5432,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    allowExitOnIdle: false,
    ssl: {
      rejectUnauthorized: false,
    },
  };

  static async executeQuery<T>(
    query: string,
    params: any[] = []
  ): Promise<T[]> {
    const client = new Client(this.DBConfig);
    try {
      await client.connect();
      const result = await client.query(query, params);

      const parsedRows = result.rows.map((row) => {
        const newRow: any = { ...row };

        for (const key in newRow) {
          const value = newRow[key];
        }
        return newRow as T;
      });

      return parsedRows;
    } catch (error) {
      console.error("Error in connection query: ", error);
      throw error;
    } finally {
      await client.end().catch((error) => {
        console.error("Error ending client connection:", error);
      });
    }
  }
}
