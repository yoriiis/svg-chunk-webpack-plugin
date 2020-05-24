interface Sprites {
	name: string;
	content: string;
	svgs: Array<string>;
}

export = function templatePreview(sprites: Array<Sprites>) {
	/* prettier-ignore */
	return `<!DOCTYPE html>
				<html>
					<head>
						<title>Preview - Svg Sprite</title>
						<meta name="viewport" content="width=device-width, initial-scale=1" />
						<style>
							.svgList {
								margin: 0;
								padding: 0;
							}
							.svgItem{
								display: inline-block;
								vertical-align: top;;
								width: calc(100% / 9);
								text-align: center;
								margin-left: 20px;
							}
							.svgItem:first-child {
								margin-left: 0;
							}
							.svgItem-icon {
								width: 100%;
							}
							.svgItem-name {
								font-weight: bold;
							}
						</style>
					</head>
					<body>
						${sprites.map(sprite => `
							<fieldset class="svgList">
								<legend>${sprite.name}.svg</legend>
								${sprite.svgs.map(svg => `
									<div class="svgItem">
										<svg class="svgItem-icon">
											<use xlink:href="#${svg}"></use>
										</svg>
										<span class="svgItem-name">${svg}</span>
									</div>
								`).join('')}
								${sprite.content}
							</fieldset>
						`).join('')}
					</body>
				</html>`;
};
