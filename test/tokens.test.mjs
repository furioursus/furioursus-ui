import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { build, contrastOnPage, flatten, loadTokens, resolveColor, root } from "../scripts/build.mjs";
import { parseColor } from "../scripts/color.mjs";

const tokens = loadTokens();
const THEMES = ["light", "dark"];

test("every colour has either one value or a light and dark pair", () => {
	for (const [name, t] of Object.entries(tokens.color)) {
		const single = t.value !== undefined;
		const pair = t.light !== undefined && t.dark !== undefined;
		assert.ok(single !== pair, `color.${name} needs "value" or both "light" and "dark", not both`);
		assert.ok(["ground", "text", "decor", "status"].includes(t.role), `color.${name} has an unknown role`);
		assert.ok(t.description, `color.${name} needs a description`);
	}
});

test("references resolve to colours the build can parse or CSS can compute", () => {
	for (const name of Object.keys(tokens.color)) {
		for (const theme of THEMES) {
			const value = resolveColor(tokens, name, theme);
			assert.ok(parseColor(value) || value.startsWith("color-mix("), `color.${name} (${theme}) is "${value}"`);
		}
	}
});

test("text colours reach 4.5:1 on the page in both themes", () => {
	for (const [name, t] of Object.entries(tokens.color)) {
		if (t.role !== "text") continue;
		for (const theme of THEMES) {
			const ratio = contrastOnPage(tokens, name, theme);
			assert.ok(ratio >= 4.5, `color.${name} is ${ratio.toFixed(2)}:1 on the ${theme} page`);
		}
	}
});

test("the page colours match the hex values the sites hard-code for theme-color", () => {
	const theme = readFileSync(join(root, "dist/theme.js"), "utf8");
	assert.match(theme, /"light":"#e8e3e2"/);
	assert.match(theme, /"dark":"#141414"/);
});

test("CSS variable names are unique", () => {
	const names = flatten(tokens).map((v) => v.name);
	assert.deepEqual(names, [...new Set(names)]);
});

test("generated files are up to date (run `npm run build`)", () => {
	for (const [path, expected] of Object.entries(build(tokens))) {
		const actual = readFileSync(join(root, path), "utf8");
		assert.equal(actual, expected, `${path} is stale`);
	}
});
