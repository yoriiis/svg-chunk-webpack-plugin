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
    originalSource: Function;
}
export interface Chunk {
    buildInfo: Object;
    userRequest: string;
    originalSource: Function;
}
