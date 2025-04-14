import type { Compiler, sources } from 'webpack';

export type EntryCache = {
	source: sources.RawSource;
	sprite: string;
	filename: string;
	svgPaths: string[];
	svgNames: string[];
};

export type Svgs = {
	name: string;
	content: string;
};

export type SvgsData = {
	svgPaths: string[];
	svgNames: string[];
	svgs: Svgs[];
};

export type SpriteManifest = Record<string, string[]>;

export type Sprite = {
	entryName: string;
	source: sources.RawSource;
	sprite: string;
	svgs: string[];
};

export type LoaderOptions = {
	configFile?: string | boolean;
	config?: Record<string,unknown> | ((resourcePath:string) => Record<string,unknown>)
};

export type LoaderThis = {
	getOptions: () => LoaderOptions;
	context: string;
	resourcePath:string;
	_compiler: Compiler;
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
};

export type SvgstoreConfig = {
	cleanDefs?: boolean | string[];
	cleanSymbols?: boolean | string[];
	svgAttrs?: boolean | Record<string, string | null | ((value: string) => string)>;
	symbolAttrs?: boolean | Record<string, string | null | ((value: string) => string)>;
	copyAttrs?: boolean | string[];
	renameDefs?: boolean;
	inline?: boolean;
};

export type PluginOptions = {
	filename: string;
	svgstoreConfig: SvgstoreConfig;
	generateSpritesManifest: boolean;
	generateSpritesPreview: boolean;
};
