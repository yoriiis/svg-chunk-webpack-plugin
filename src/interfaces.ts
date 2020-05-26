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
