import path from 'path';

/**
 * Mock implementation of getEntryNames function
 *
 * @param {Class} svgChunkWebpackPlugin Instance of svgChunkWebpackPlugin
 * @param {String} entryNames Entrypoint name
 */
export function mockGetEntryNames(svgChunkWebpackPlugin, entryNames) {
	svgChunkWebpackPlugin.getEntryNames = jest.fn().mockImplementation(() => {
		return entryNames;
	});
}

/**
 * Mock implementation of getSvgsDependenciesByEntrypoint function
 *
 * @param {Class} svgChunkWebpackPlugin Instance of svgChunkWebpackPlugin
 * @param {Array} svgsDependencies List of SVG dependencies
 */
export function mockGetSvgsDependenciesByEntrypoint(svgChunkWebpackPlugin, svgsDependencies) {
	svgChunkWebpackPlugin.getSvgsDependenciesByEntrypoint = jest.fn().mockImplementation(() => {
		return svgsDependencies;
	});
}

/**
 * Mock implementation of optimizeSvg function
 *
 * @param {Class} svgChunkWebpackPlugin Instance of svgChunkWebpackPlugin
 * @param {Object} svgsFixture List of sprite fixtures
 */
export function mockOptimizeSvg(svgChunkWebpackPlugin, svgsFixture) {
	svgChunkWebpackPlugin.optimizeSvg = jest.fn().mockImplementation((moduleDependency) => {
		const name = path.basename(moduleDependency.userRequest, '.svg');
		return {
			name,
			content: svgsFixture[name]
		};
	});
}

/**
 * Mock implementation of generateSprite function
 *
 * @param {Class} svgChunkWebpackPlugin Instance of svgChunkWebpackPlugin
 * @param {String} sprite Sprite fixture
 */
export function mockGenerateSprite(svgChunkWebpackPlugin, sprite) {
	svgChunkWebpackPlugin.generateSprite = jest.fn().mockImplementation(() => {
		return sprite;
	});
}

/**
 * Mock implementation of getBuildHash function
 *
 * @param {Class} svgChunkWebpackPlugin Instance of svgChunkWebpackPlugin
 */
export function mockGetBuildHash(svgChunkWebpackPlugin) {
	svgChunkWebpackPlugin.getBuildHash = jest.fn().mockImplementation(() => '4cc05208d925b7b31259');
}

/**
 * Mock implementation of getChunkHash function
 *
 * @param {Class} svgChunkWebpackPlugin Instance of svgChunkWebpackPlugin
 */
export function mockGetChunkHash(svgChunkWebpackPlugin) {
	svgChunkWebpackPlugin.getChunkHash = jest
		.fn()
		.mockImplementation(() => 'beb18939e5093045258b8d24a34dd844');
}

/**
 * Mock implementation of getContentHash function
 *
 * @param {Class} svgChunkWebpackPlugin Instance of svgChunkWebpackPlugin
 */
export function mockGetContentHash(svgChunkWebpackPlugin) {
	svgChunkWebpackPlugin.getContentHash = jest
		.fn()
		.mockImplementation(() => 'a5934d97b38c748213317d7e5ffd31b6');
}
