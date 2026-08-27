import { APIRequestContext, request } from '@playwright/test';
import config from '../playwright.config';

class ApiContext {
	private constructor() {}

	public static async getInstance(token?: string): Promise<APIRequestContext> {
		const headers: Record<string, string> = {
			...config.use?.extraHTTPHeaders
		};

		if (token) {
			headers['Authorization'] = 'Bearer ' + token;
		}

		return await request.newContext({
			baseURL: config.use?.baseURL,
			extraHTTPHeaders: headers
		});
	}
}

export default ApiContext;
