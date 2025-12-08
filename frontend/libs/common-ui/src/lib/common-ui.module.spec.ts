import { TestBed } from '@angular/core/testing';
import { Environment } from '@frontend/common';

import { CommonUiModule } from './common-ui.module';

describe('CommonUiModule', () => {
	it('should be created', () => {
		expect(CommonUiModule).toBeDefined();
	});

	it('should provide forRoot method returning ModuleWithProviders', () => {
		const env: Environment = { production: false } as Environment;
		const result = CommonUiModule.forRoot(env);
		expect(result.ngModule).toBe(CommonUiModule);
		expect(result.providers).toEqual([
			{
				provide: 'env',
				useValue: env,
			},
		]);
	});

	it('should be injectable via TestBed', () => {
		TestBed.configureTestingModule({
			imports: [CommonUiModule],
		});
		const moduleInstance = TestBed.inject(CommonUiModule);
		expect(moduleInstance).toBeInstanceOf(CommonUiModule);
	});
});
