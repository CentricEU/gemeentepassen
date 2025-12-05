import {Client} from 'pg';
import * as fs from 'fs';
import * as path from 'path';

require('dotenv').config();

export class DataBase {
    private DBConfig = {
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        port: 5432,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        allowExitOnIdle: false,
        ssl: {
            rejectUnauthorized: false,
        },
    };

    async executeQuery(query: string): Promise<any[]> {
        const client = new Client(this.DBConfig);
        try {
            await client.connect();
            const result = await client.query(query);
            return result.rows;
        } catch (error) {
            console.error('Error in connection query: ', error);
            throw error; // Rethrow the error to indicate test failure
        } finally {
            await client.end().catch((error) => {
                console.error('Error ending client connection:', error);
            });
        }
    }

    async executeQueryFromFile(filePath: string, params?: any[]): Promise<void> {
        const client = new Client(this.DBConfig);
        try {
            await client.connect();

            const scriptPath = path.join(__dirname, filePath);
            let script = fs.readFileSync(scriptPath, 'utf-8');

            if (params && params.length > 0) {
                // Replace placeholders in script with provided params
                params.forEach((param, index) => {
                    script = script.replace(new RegExp(`\\$${index + 1}`, 'g'), `'${param}'`);
                });
            }

            // Execute the script with the provided parameters
            await client.query(script);

        } catch (error) {
            console.error('Error executing SQL script:', error);
            throw error;
        } finally {
            await client.end().catch((error) => {
                console.error('Error ending client connection:', error);
            });
        }
    }
}