const { defaults: tsjPreset } = require('ts-jest/presets');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	...tsjPreset,
	preset: 'react-native',
	setupFilesAfterEnv: ['./jestSetup.js'],
	transform: {
		'^.+\\.jsx$': 'babel-jest',
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: 'tsconfig.spec.json'
			}
		]
	},
	transformIgnorePatterns: ['node_modules/(?!(@react-native|react-native|react-native-vector-icons)/)'],
	moduleNameMapper: {
		'react-native-permissions': '<rootDir>/__mocks__/react-native-permissions.js'
	},
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node']
};
