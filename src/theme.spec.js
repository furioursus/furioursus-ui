import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { mount } from "@vue/test-utils";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./vue/index.js";

// Runs the real built dist/theme.js (npm run build first) against jsdom, which has no matchMedia.
const root = document.documentElement;
beforeAll(() => {
	window.matchMedia = () => ({ matches: false, addEventListener() {} });
	(0, eval)(readFileSync(resolve(process.cwd(), "dist/theme.js"), "utf8"));
});
beforeEach(() => {
	localStorage.clear();
	window.furioursusTheme.set("light");
	document.body.innerHTML = "";
});

describe("theme.js toggles", () => {
	it("makes a plain static button work, with no Vue", () => {
		document.body.innerHTML = '<button type="button" role="switch" data-theme-toggle><span>x</span></button>';
		const button = document.querySelector("button");
		button.querySelector("span").click();
		expect(root.getAttribute("data-theme")).toBe("dark");
		expect(button.getAttribute("aria-checked")).toBe("true");
		expect(button.title).toBe("Switch to light mode");
	});

	it("labels a non-switch toggle with the action instead", () => {
		document.body.innerHTML = '<button type="button" data-theme-toggle></button>';
		document.querySelector("button").click();
		expect(document.querySelector("button").getAttribute("aria-label")).toBe("Switch to light mode");
		expect(document.querySelector("button").hasAttribute("aria-checked")).toBe(false);
	});

	it("flips exactly once per click on a mounted ThemeToggle", async () => {
		const wrapper = mount(ThemeToggle, { attachTo: document.body });
		await wrapper.get("button").trigger("click");
		expect(root.getAttribute("data-theme")).toBe("dark");
		await wrapper.vm.$nextTick();
		expect(wrapper.get("button").attributes("aria-checked")).toBe("true");
		await wrapper.get("button").trigger("click");
		expect(root.getAttribute("data-theme")).toBe("light");
		wrapper.unmount();
	});

	it("saves only a choice that differs from the system", () => {
		document.body.innerHTML = '<button type="button" data-theme-toggle></button>';
		document.querySelector("button").click();
		expect(localStorage.getItem("theme")).toBe("dark");
		document.querySelector("button").click();
		expect(localStorage.getItem("theme")).toBeNull();
	});
});
