#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const RESET = '\x1b[0m';

const errors = [];

// Config
const EXPECTED = JSON.parse(fs.readFileSync(path.join(__dirname, 'expected-output.json'), 'utf-8'));
const WEBPACK_DIST = path.join(__dirname, 'dist');
const _RSPACK_DIST = path.join(__dirname, 'dist-rspack');

function error(msg) {
	errors.push(msg);
	console.log(`${RED}✗ ${msg}${RESET}`);
}

function success(msg) {
	console.log(`${GREEN}✓ ${msg}${RESET}`);
}

function extractSymbolIds(svgContent) {
	return [...svgContent.matchAll(/<symbol\s+id="([^"]+)"/g)].map((m) => m[1]);
}

function checkBuild(name, distDir) {
	console.log(`\n${name}:`);

	if (!fs.existsSync(distDir)) {
		error(`${name}: Directory ${distDir} not found`);
		return;
	}

	// Check manifest
	const manifest = JSON.parse(
		fs.readFileSync(path.join(distDir, 'sprites-manifest.json'), 'utf-8')
	);
	for (const [entry, { paths }] of Object.entries(EXPECTED.entries)) {
		const actualPaths = manifest[entry] || [];
		const actual = actualPaths.join(',');
		const expectedPaths = paths.join(',');
		if (actual === expectedPaths) {
			success(`${name} manifest: ${entry} (${paths.length} SVGs)`);
		} else {
			error(
				`${name} manifest: ${entry} mismatch (expected ${paths.length}, got ${actualPaths.length})\n  Expected: ${expectedPaths}\n  Got: ${actual}`
			);
		}
	}

	// Check sprite files
	for (const [entry, { svgs }] of Object.entries(EXPECTED.entries)) {
		const sprite = fs.readFileSync(path.join(distDir, `sprites/${entry}.svg`), 'utf-8');
		const actualSymbols = extractSymbolIds(sprite);
		const actual = actualSymbols.join(',');
		const expectedSvgs = svgs.join(',');
		if (actual === expectedSvgs) {
			success(`${name} sprite: ${entry}.svg (${svgs.length} symbols)`);
		} else {
			error(
				`${name} sprite: ${entry}.svg mismatch (expected ${svgs.length}, got ${actualSymbols.length})\n  Expected: ${expectedSvgs}\n  Got: ${actual}`
			);
		}
	}

	// Check HTML injected sprites
	for (const [entry, { svgs }] of Object.entries(EXPECTED.entries)) {
		const htmlPath = path.join(distDir, `${entry}.html`);
		if (fs.existsSync(htmlPath)) {
			const html = fs.readFileSync(htmlPath, 'utf-8');
			const svgMatch = html.match(/<svg[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/svg>/i);
			if (svgMatch) {
				const actualSymbols = extractSymbolIds(svgMatch[0]);
				const actual = actualSymbols.join(',');
				const expectedSvgs = svgs.join(',');
				if (actual === expectedSvgs) {
					success(`${name} HTML: ${entry}.html injected sprite (${svgs.length} symbols)`);
				} else {
					error(
						`${name} HTML: ${entry}.html injected sprite mismatch (expected ${svgs.length}, got ${actualSymbols.length})\n  Expected: ${expectedSvgs}\n  Got: ${actual}`
					);
				}
			}
		}
	}
}

checkBuild('Webpack', WEBPACK_DIST);

console.log(
	errors.length === 0
		? `\n${GREEN}✓ All checks passed!${RESET}\n`
		: `\n${RED}✗ ${errors.length} error(s) found${RESET}\n`
);

process.exit(errors.length === 0 ? 0 : 1);
