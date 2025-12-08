import * as fs from 'fs';
import { logger } from './logger';

export const safeJsonParse = (str: string) => {
	try {
		return JSON.parse(str);
	} catch {
    logger.error('Failed to parse JSON string:', str);
		return undefined;
	}
};

export const loadJsonFile = <T>(filePath: string): T | undefined => {
	try {
		const jsonString = fs.readFileSync(filePath, 'utf-8');
		return safeJsonParse(jsonString);
	} catch (error) {
		console.error(`Error reading JSON file at ${filePath}:`, error);
		return undefined;
	}
};
