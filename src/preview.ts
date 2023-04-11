import { Sprite } from './interfaces';

export = function templatePreview(sprites: Array<Sprite>): string {
	/* prettier-ignore */
	return `<!DOCTYPE html>
				<html lang="en">
					<head>
						<title>Preview - SvgChunkWebpackPlugin</title>
						<meta name="viewport" content="width=device-width, initial-scale=1" />
						<style>
							body {
								font-family: helvetica, arial, sans-serif;
								margin: 0;
								padding: 0;
							}
							* {
								box-sizing: border-box;
							}
							.spriteItem {
								padding: 20px 10px;
							}
							.spriteItem:not(:first-child) {
								margin-top: 20px;
							}
							.spriteItemName {
								color: #495057;
								font-size: 25px;
								border-bottom: 4px solid #e9ecef;
								padding-bottom: 10px;
								margin: 0 auto;
								width: calc(100% - 20px);
								margin-bottom: 10px;
							}
							.svgListItem {
								display: inline-block;
								vertical-align: top;
								width: 100px;
								text-align: center;
								padding: 10px;
							}
							.svgItem:first-child {
								margin-left: 0;
							}
							.svgItem-icon {
								width: 100%;
								height: 80px;
								margin-bottom: 10px;
							}
							.svgItem-name {
								font-size: 12px;
								color: #adb5bd;
							}
						</style>
					</head>
					<body>
						${sprites.map(sprite => `
							<div class="spriteItem">
								<h2 class="spriteItemName">${sprite.entryName}.svg</h2>
								<div class="svgList">
									${sprite.svgs.map(svg => `
										<div class="svgListItem">
											<svg class="svgItem-icon">
												<use xlink:href="#${svg}"></use>
											</svg>
											<span class="svgItem-name">${svg}</span>
										</div>
									`).join('')}
									${sprite.source.source()}
								</div>
							</div>
						`).join('')}
					</body>
				</html>`;
};
