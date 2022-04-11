module.exports = {
	multipass: true,
	plugins: [
		{
			name: 'preset-default',
			params: {
				overrides: {
					inlineStyles: {
						onlyMatchedOnce: false
					}
				}
			}
		},
		{
			name: 'convertStyleToAttrs' // Disabled by default since v2.1.0
		}
	]
};
