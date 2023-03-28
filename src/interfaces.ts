export interface Svgs {
	name: string;
	content: string;
}

export interface SpriteManifest {
	[key: string]: Array<string>;
}

export interface Sprites {
	name: string;
	content: string;
	svgs: Array<string>;
}

export interface NormalModuleSource {
	_value: string;
}

export interface NormalModule {
	buildInfo: {
		hash: string;
	};
	userRequest: string;
	originalSource: () => NormalModuleSource;
}

export interface Chunk {
	buildInfo: any;
	userRequest: string;
	originalSource: () => NormalModuleSource;
}

export interface LoaderOptions {
	configFile: string;
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
}
