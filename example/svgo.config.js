import crypto from 'node:crypto';

export default {
	multipass: true,
	plugins: [
		{
			name: 'preset-default',
			params: {
				overrides: {
					inlineStyles: {
						onlyMatchedOnce: false
					},
					removeViewBox: false
				}
			}
		},
		{
			name: 'convertStyleToAttrs' // Disabled by default since v2.1.0
		},
		{
			name: 'prefixIds',
			params: {
				delim: '',
				prefix: () => crypto.randomBytes(20).toString('hex').slice(0, 4)
			}
		}
	]
};
