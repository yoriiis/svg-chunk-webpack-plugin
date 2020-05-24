import path from 'path';

/**
 * Mock implementation of getEntryNames function
 *
 * @param {Class} svgSprite Instance of svgSprite
 */
export function mockGetEntryNames (svgSprite, entryNames) {
	svgSprite.getEntryNames = jest.fn().mockImplementation(() => {
		return entryNames;
	});
}

export function mockGetSvgsByEntrypoint (svgSprite) {
	svgSprite.getSvgsByEntrypoint = jest.fn().mockImplementation(() => {
		return [
			'example/src/svgs/gradient.svg',
			'example/src/svgs/heart.svg',
			'example/src/svgs/smiley.svg'
		];
	});
}

export function mockOptimizeSvg (svgSprite, svgsFixture) {
	svgSprite.optimizeSvg = jest.fn().mockImplementation(filepath => {
		const svgName = path.basename(filepath, '.svg');
		return {
			name: svgName,
			content: svgsFixture[svgName]
		};
	});
}

export function mockGenerateSprite (svgSprite, sprite) {
	svgSprite.generateSprite = jest.fn().mockImplementation(() => {
		return sprite;
	});
}
