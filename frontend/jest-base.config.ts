export default {
	preset: '../../jest.preset.js',
	setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
	coverageReporters: ['clover', 'json', 'lcov', 'text', 'text-summary', 'cobertura'],
	collectCoverage: true,
	collectCoverageFrom: ['**/*.{ts,tsx}', '!**/coverage/**', '!**/vendor/**'],
	//coverageReporters: ["clover", "json", "lcov", "text"],
	coverageThreshold: {
		global: {
			branches: 85,
			functions: 90,
			lines: 90,
			statements: -10
		}
	},
	coveragePathIgnorePatterns: [
		'.model.ts',
		'.enum.ts',
		'.constants.ts',
		'.config.ts',
		'environment.',
		'main.ts',
		'app.module.ts',
		'app.routes.ts',
		'index.ts',
		'.mock.ts',
		'.guard.ts',
		'routing.module.ts',
		'common.module.ts',
		'supplier.module.ts',
		'date-adapter.module.ts'
	],
	transform: {
		'^.+\\.(ts|mjs|js|html)$': [
			'jest-preset-angular',
			{
				tsconfig: '<rootDir>/tsconfig.spec.json',
				stringifyContentPathRegex: '\\.(html|svg)$'
			}
		]
	},
	transformIgnorePatterns: [
		'node_modules/(?!.*\\.mjs$|ol/|ol/source|ol|quick-lru|lodash-es|color-(space|parse|rgba|name)/)'
	],
	snapshotSerializers: [
		'jest-preset-angular/build/serializers/no-ng-attributes',
		'jest-preset-angular/build/serializers/ng-snapshot',
		'jest-preset-angular/build/serializers/html-comment'
	]
};
