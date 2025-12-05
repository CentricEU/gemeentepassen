import { Injectable } from '@angular/core';

@Injectable()
export class MockRouter {
	navigateByUrl(url: string): Promise<boolean> {
		return Promise.resolve(true);
	}

	navigate(): Promise<boolean> {
		return Promise.resolve(true);
	}
}
