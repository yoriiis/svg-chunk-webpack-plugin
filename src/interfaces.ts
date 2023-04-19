import { type sources } from 'webpack';

export interface EntryCache {
	source: sources.RawSource;
	sprite: string;
	filename: string;
	svgPaths: Array<string>;
	svgNames: Array<string>;
}

export interface Svgs {
	name: string;
	content: string;
}

export interface SvgsData {
	svgPaths: Array<string>;
	svgNames: Array<string>;
	svgs: Array<Svgs>;
}

export interface SpriteManifest {
	[key: string]: Array<string>;
}

export interface Sprite {
	entryName: string;
	source: sources.RawSource;
	sprite: string;
	svgs: Array<string>;
}

export interface LoaderOptions {
	configFile: string | boolean;
}

export interface LoaderThis {
	getOptions: () => LoaderOptions;
	context: string;
	_compiler: any;
	async: () => (error: any, result?: string) => string;
	_module: {
		factoryMeta: {
			sideEffectFree: boolean;
		};
		buildInfo: {
			SVG_CHUNK_WEBPACK_PLUGIN: true;
		};
	};
	emitError: (error: Error) => void;
}

export interface SvgstoreConfig {
	cleanDefs?: boolean | string[];
	cleanSymbols?: boolean | string[];
	svgAttrs?: boolean | Record<string, string | null | ((value: string) => string)>;
	symbolAttrs?: boolean | Record<string, string | null | ((value: string) => string)>;
	copyAttrs?: boolean | string[];
	renameDefs?: boolean;
	inline?: boolean;
}

export interface PluginOptions {
	filename: string;
	svgstoreConfig: SvgstoreConfig;
	generateSpritesManifest: boolean;
	generateSpritesPreview: boolean;
}
