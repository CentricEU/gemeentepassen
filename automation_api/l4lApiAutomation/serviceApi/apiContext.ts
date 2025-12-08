import { APIRequestContext, request } from '@playwright/test';
import config from '../playwright.config';

class ApiContext {
	private static instance: APIRequestContext;

	private constructor() {}

	public static async getInstance(): Promise<APIRequestContext> {
		const headers: Record<string, string> = {
			...config.use?.extraHTTPHeaders
		};

		if (process.env.TOKEN) {
			headers['Authorization'] = 'Bearer ' + process.env.TOKEN;
		}

		return (this.instance = await request.newContext({
			baseURL: config.use?.baseURL,
			extraHTTPHeaders: headers
		}));
	}
}

export default ApiContext;
