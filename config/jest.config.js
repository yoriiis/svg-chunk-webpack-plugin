module.exports = {
	moduleFileExtensions: ['js', 'ts'],
	modulePaths: ['<rootDir>/src'],
	preset: 'ts-jest/presets/js-with-babel',
	resetModules: true,
	rootDir: '../',
    transform: {
		'\\.(js|jsx|ts|tsx)$': ['ts-jest', { configFile: './config/babel.config.js' }]
	},
	verbose: true
}