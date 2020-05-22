<!DOCTYPE html>
<html>
	<head>
		<title>Basic usage</title>
		<meta name="viewport" content="width=device-width, initial-scale=1" />
	</head>
	<body>
		<fieldset>
			<legend>home.svg</legend>
			<svg>
				<use xlink:href="#hand-hello"></use>
			</svg>
			<svg>
				<use xlink:href="#smiley-sad"></use>
			</svg>
			<svg>
				<use xlink:href="#tv-grid"></use>
			</svg>
			<svg>
				<use xlink:href="#heart"></use>
			</svg>
			<?php include './dist/home.svg' ?>
		</fieldset>
		<fieldset>
			<legend>news.svg</legend>
			<svg>
				<use xlink:href="#video"></use>
			</svg>
			<svg>
				<use xlink:href="#illustration-alert"></use>
			</svg>
			<?php include './dist/news.svg' ?>
		</fieldset>
	</body>
</html>
