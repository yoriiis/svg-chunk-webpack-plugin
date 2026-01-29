import fs from 'node:fs';
import path from 'node:path';
import { rspack } from '@rspack/core';
import createConfig from './config.common.ts';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

export default (env: any, argv: { mode: string }) => {
	const config = createConfig(env, argv);

	config.output.path = resolveApp('dist-rspack');
	config.output.publicPath = '/dist-rspack/';

	config.plugins.push(
		new rspack.HtmlRspackPlugin({
			filename: 'home.html',
			template: resolveApp('src/templates/home.html'),
			inject: 'head',
			chunks: ['home']
		})
	);

	return config;
};
