import { expect } from '@playwright/test';

export class AssertHelper {
	static compareData(apiResponse: unknown, queryResponse: unknown): void {
		const compare = (a: unknown, b: unknown, path: string = ''): void => {
			if (a === null || b === null) {
				expect(a).toBe(b);
				return;
			}

			if (typeof a === 'object' && typeof b === 'object') {
				const keys = Object.keys(a);

				for (const key of keys) {
					if (!(key in b)) {
						throw new Error(`Key '${path}${key}' not found in query response`);
					}

					compare(a[key], b[key], `${path}${key}.`);
				}
			} else {
				expect(a).toBe(b);
			}
		};

		compare(apiResponse, queryResponse);
	}

	static compareDataList(apiResponseList: unknown[], queryResponseList: unknown[]): void {
		expect(Array.isArray(apiResponseList)).toBe(true);
		expect(Array.isArray(queryResponseList)).toBe(true);
		expect(apiResponseList.length).toBe(queryResponseList.length);

		for (let i = 0; i < apiResponseList.length; i++) {
			this.compareData(apiResponseList[i], queryResponseList[i]);
		}
	}

	static hasInvalidValues(data : unknown, options? : {allowEmptyString? : boolean}) : boolean{
		const {allowEmptyString = true} = options ?? {};

		if(data == null || data == undefined) return true;

		if(typeof data === 'number' && Number.isNaN(data)) return true;

		if(typeof data === 'string' && !allowEmptyString && data.trim() === '') return true;

		if(Array.isArray(data)){
    		return data.some(item => this.hasInvalidValues(item, options));
		}

		if (typeof data === 'object') {
    		return Object.values(data as Record<string, unknown>)
      			.some(value => this.hasInvalidValues(value, options));
		}

		return false;
  }
}