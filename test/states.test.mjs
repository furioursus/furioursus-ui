import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { root } from "../scripts/build.mjs";

// Every state must change shape as well as color (christopher has protanopia): docs/components.md.
const STATE = /:hover|:active|:disabled|\[aria-(?:selected|pressed|disabled)="true"\]/;
const COLOR_ONLY = new Set([
	"color",
	"background-color",
	"border-color",
	"outline-color",
	"text-decoration-color",
	"fill",
	"stroke",
]);

// The compound selector holding the state ("a.fu-ranked__item:hover" in "a.fu-ranked__item:hover .x"),
// so rules that style one state of one element on different children are judged together.
function stateKey(selector) {
	const at = selector.search(STATE);
	if (at === -1) return null;
	let depth = 0;
	for (let i = at; i < selector.length; i++) {
		if (selector[i] === "(") depth++;
		else if (selector[i] === ")") depth--;
		else if (depth === 0 && /[\s>+~]/.test(selector[i])) return selector.slice(0, i);
	}
	return selector;
}

test("no state in the component styles is a color change alone", () => {
	const css = readFileSync(join(root, "dist/vue/style.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
	const states = new Map();
	for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
		const props = [...body.matchAll(/([\w-]+)\s*:/g)].map((m) => m[1]);
		for (const selector of selectors.split(",")) {
			const key = stateKey(selector.trim());
			if (key) states.set(key, [...(states.get(key) ?? []), ...props]);
		}
	}
	assert.ok(states.size > 0, "found no state rules: has dist/vue/style.css moved?");
	const colorOnly = [...states].filter(([, props]) => props.every((p) => COLOR_ONLY.has(p))).map(([k]) => k);
	assert.deepEqual(colorOnly, [], "add a shape change (underline, nudge, stroke, weight…) to these states");
});
