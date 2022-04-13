export type Fn = () => void;

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

export interface NormalModule {
	userRequest: string;
	originalSource: Fn;
}

export interface Chunk {
	buildInfo: any;
	userRequest: string;
	originalSource: Fn;
}
