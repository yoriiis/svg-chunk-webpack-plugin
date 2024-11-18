import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const PACKAGE_NAME = 'svg-chunk-webpack-plugin' as const;

export const esmResolve = (filePath: string) =>
	path.resolve(path.dirname(fileURLToPath(import.meta.url)), filePath);
