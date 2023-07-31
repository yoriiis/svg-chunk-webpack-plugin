import path from 'path';
import { fileURLToPath } from 'url';

export const PACKAGE_NAME = 'svg-chunk-webpack-plugin' as const;

export const esmResolve = (filePath: string) =>
	path.resolve(path.dirname(fileURLToPath(import.meta.url)), filePath);
