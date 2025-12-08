import { Client } from 'pg';
import { safeJsonParse } from '../utils/jsonHelper';

require('dotenv').config();

export class DataBase {
	private static DBConfig = {
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		port: 5432,
		idleTimeoutMillis: 30000,
		connectionTimeoutMillis: 2000,
		allowExitOnIdle: false,
		ssl: {
			rejectUnauthorized: false
		}
	};

	static async executeQuery<T>(query: string, params: any[] = []): Promise<T[]> {
		const client = new Client(this.DBConfig);
		try {
			await client.connect();
			const result = await client.query(query, params);

			const parsedRows = result.rows.map((row) => {
				const newRow: any = { ...row };

				for (const key in newRow) {
					const value = newRow[key];

					if (typeof value === 'string' && value.trim().startsWith('{') && value.trim().endsWith('}')) {
            newRow[key]=safeJsonParse(value);
					}
				}
				return newRow as T;
			});

			return parsedRows;
		} catch (error) {
			console.error('Error in connection query: ', error);
			throw error;
		} finally {
			await client.end().catch((error) => {
				console.error('Error ending client connection:', error);
			});
		}
	}
}
