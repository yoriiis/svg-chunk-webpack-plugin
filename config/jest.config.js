export default {
	moduleFileExtensions: ['js', 'ts'],
	modulePaths: ['<rootDir>/src'],
	resetModules: true,
	rootDir: '../',
	transform: {
		'\\.(js|ts)$': [
			'ts-jest',
			{
				diagnostics: {
					// Disable error reporting with import assertions
					ignoreCodes: ['TS1343', 'TS2821', 'TS2823']
				}
			}
		]
	},
	moduleNameMapper: {
		'^@src(.*)$': '<rootDir>/src$1'
	},
	resolver: 'jest-ts-webcompat-resolver', // Used to fix .js resolution in .ts files
	testMatch: ['<rootDir>/tests/*.test.js'],
	verbose: true,
	resetMocks: true
};
