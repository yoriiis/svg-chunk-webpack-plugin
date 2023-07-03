module.exports = {
	env: {
		browser: true,
		es6: true,
		jest: true,
		node: true
	},

	extends: ['standard', 'plugin:prettier/recommended', 'plugin:@typescript-eslint/recommended'],

	globals: {
		document: false,
		window: false
	},

	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaFeatures: {
			experimentalObjectRestSpread: true,
			impliedStrict: true
		},
		ecmaVersion: 6,
		sourceType: 'module'
	},

	plugins: ['@typescript-eslint'],

	rules: {
		'@typescript-eslint/ban-ts-comment': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-var-requires': 'off',
		indent: ['error', 'tab', { ignoredNodes: ['TemplateLiteral > *'] }],
		'no-console': 0,
		'no-tabs': 0,
		'space-before-function-paren': [
			'error',
			{ anonymous: 'never', asyncArrow: 'always', named: 'never' }
		],
		'linebreak-style': ['error', 'unix']
	},

	ignorePatterns: ['node_modules', 'coverage', 'dist', 'lib', 'types']
};
