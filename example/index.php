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
				<use xlink:href="#gradient"></use>
			</svg>
			<svg>
				<use xlink:href="#heart"></use>
			</svg>
			<svg>
				<use xlink:href="#smiley"></use>
			</svg>
			<?php include './dist/home.svg' ?>
		</fieldset>
		<fieldset>
			<legend>news.svg</legend>
			<svg>
				<use xlink:href="#tram"></use>
			</svg>
			<svg>
				<use xlink:href="#video"></use>
			</svg>
			<?php include './dist/news.svg' ?>
		</fieldset>
	</body>
</html>
