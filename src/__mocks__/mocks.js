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

/**
 * Mock implementation of getEntryNames function
 *
 * @param {Class} svgSprite Instance of svgSprite
 */
// export function getSvgsByEntrypoints (svgSprite, entryNames) {
// 	svgSprite.getSvgsByEntrypoints = jest.fn().mockImplementation(() => {
// 		return entryNames;
// 	});
// }
