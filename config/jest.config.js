module.exports = {
	moduleFileExtensions: ['js', 'ts'],
	modulePaths: ['<rootDir>/src'],
	resetModules: true,
	rootDir: '../',
	transform: {
		'\\.(js|ts)$': 'ts-jest'
	},
	moduleNameMapper: {
		'^@src(.*)$': '<rootDir>/src$1'
	},
	testMatch: ['<rootDir>/tests/*.test.js'],
	verbose: true,
	resetMocks: true
};
