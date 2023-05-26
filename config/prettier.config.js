module.exports = {
	arrowParens: 'always',
	overrides: [
		{
			files: '*.md',
			options: {
				proseWrap: 'preserve',
				semi: true,
				singleQuote: true,
				tabWidth: 2,
				useTabs: false
			}
		},
		{
			files: '*.html',
			options: {
				printWidth: 500
			}
		}
	],
	printWidth: 100,
	semi: true,
	singleQuote: true,
	trailingComma: 'none',
	useTabs: true,
	endOfLine: 'lf'
};
