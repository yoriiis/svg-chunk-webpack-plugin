import path from 'path';

/**
 * Mock implementation of getEntryNames function
 *
 * @param {Class} svgSprite Instance of svgSprite
 * @param {String} entryNames Entrypoint name
 */
export function mockGetEntryNames (svgSprite, entryNames) {
	svgSprite.getEntryNames = jest.fn().mockImplementation(() => {
		return entryNames;
	});
}

/**
 * Mock implementation of getSvgsByEntrypoint function
 *
 * @param {Class} svgSprite Instance of svgSprite
 */
export function mockGetSvgsByEntrypoint (svgSprite, svgsFilepath) {
	svgSprite.getSvgsByEntrypoint = jest.fn().mockImplementation(() => {
		return svgsFilepath;
	});
}

/**
 * Mock implementation of optimizeSvg function
 *
 * @param {Class} svgSprite Instance of svgSprite
 * @param {Object} svgsFixture List of sprite fixtures
 */
export function mockOptimizeSvg (svgSprite, svgsFixture) {
	svgSprite.optimizeSvg = jest.fn().mockImplementation(filepath => {
		const name = path.basename(filepath, '.svg');
		return {
			name,
			content: svgsFixture[name]
		};
	});
}

/**
 * Mock implementation of generateSprite function
 *
 * @param {Class} svgSprite Instance of svgSprite
 * @param {String} sprite Sprite fixture
 */
export function mockGenerateSprite (svgSprite, sprite) {
	svgSprite.generateSprite = jest.fn().mockImplementation(() => {
		return sprite;
	});
}
