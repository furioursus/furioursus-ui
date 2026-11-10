import { mount } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { PeriodTabs, RankedList, ThemeToggle } from "./index.js";

const root = document.documentElement;
afterEach(() => root.removeAttribute("data-theme"));

const OPTIONS = [
	{ value: "7day", label: "Last 7 days" },
	{ value: "1month", label: "Last month" },
	{ value: "overall", label: "All time" },
];

describe("server rendering", () => {
	it("renders every component without touching the DOM", async () => {
		const app = createSSRApp({
			render: () => [
				h(ThemeToggle),
				h(PeriodTabs, { options: OPTIONS, label: "Range" }),
				h(RankedList, { title: "Top", items: [{ name: "Blue Lines", count: 1204 }] }),
			],
		});
		const html = await renderToString(app);
		expect(html).toContain('role="switch"');
		expect(html).toContain('aria-checked="false"');
		expect(html).toContain('role="tablist"');
		expect(html).toContain("Blue Lines");
	});
});

describe("ThemeToggle", () => {
	it("reflects the current theme once mounted and follows theme-changed", async () => {
		root.setAttribute("data-theme", "dark");
		const wrapper = mount(ThemeToggle, { attachTo: document.body });
		await wrapper.vm.$nextTick();
		const button = wrapper.get("button");
		expect(button.attributes("aria-checked")).toBe("true");
		expect(button.attributes("title")).toBe("Switch to light mode");

		root.setAttribute("data-theme", "light");
		document.dispatchEvent(new CustomEvent("theme-changed", { detail: { theme: "light" } }));
		await wrapper.vm.$nextTick();
		expect(button.attributes("aria-checked")).toBe("false");
		wrapper.unmount();
	});

	it("has no click handler of its own (theme.js owns the click)", async () => {
		root.setAttribute("data-theme", "light");
		const wrapper = mount(ThemeToggle);
		await wrapper.get("button").trigger("click");
		expect(root.getAttribute("data-theme")).toBe("light");
		expect(wrapper.get("button").attributes()).toHaveProperty("data-theme-toggle");
		wrapper.unmount();
	});

	it("has an accessible name", () => {
		const wrapper = mount(ThemeToggle, { props: { label: "Night mode" } });
		expect(wrapper.get(".fu-sr-only").text()).toBe("Night mode");
	});
});

describe("PeriodTabs", () => {
	const mountTabs = (props = {}) =>
		mount(PeriodTabs, { props: { options: OPTIONS, label: "Range", ...props }, attachTo: document.body });

	it("selects the first option by default, with only that tab in the tab order", () => {
		const tabs = mountTabs().findAll('[role="tab"]');
		expect(tabs.map((t) => t.attributes("aria-selected"))).toEqual(["true", "false", "false"]);
		expect(tabs.map((t) => t.attributes("tabindex"))).toEqual(["0", "-1", "-1"]);
	});

	it("emits the clicked value", async () => {
		const wrapper = mountTabs();
		await wrapper.findAll('[role="tab"]')[2].trigger("click");
		expect(wrapper.emitted("update:modelValue")).toEqual([["overall"]]);
	});

	it("moves with the arrow keys, wrapping, and with Home and End", async () => {
		const wrapper = mountTabs({ modelValue: "7day" });
		const tabs = wrapper.findAll('[role="tab"]');
		await tabs[0].trigger("keydown", { key: "ArrowLeft" });
		await tabs[2].trigger("keydown", { key: "ArrowRight" });
		await tabs[1].trigger("keydown", { key: "End" });
		await tabs[1].trigger("keydown", { key: "Home" });
		await tabs[1].trigger("keydown", { key: "Enter" });
		expect(wrapper.emitted("update:modelValue")).toEqual([["overall"], ["7day"], ["overall"], ["7day"]]);
		expect(document.activeElement).toBe(tabs[0].element);
		wrapper.unmount();
	});

	it("links tabs to panels only when given an id prefix", () => {
		const linked = mountTabs({ idPrefix: "stats", modelValue: "1month" }).findAll('[role="tab"]')[1];
		expect(linked.attributes("id")).toBe("stats-tab-1month");
		expect(linked.attributes("aria-controls")).toBe("stats-panel-1month");
		expect(mountTabs().find("[aria-controls]").exists()).toBe(false);
	});

	it("names the tab list", () => {
		expect(mountTabs().get('[role="tablist"]').attributes("aria-label")).toBe("Range");
	});
});

describe("RankedList", () => {
	const items = [
		{ name: "Blue Lines", subtitle: "Massive Attack", count: 1204, url: "https://example.com/a" },
		{ name: "Dummy", count: 986 },
	];

	it("numbers rows, formats counts, and links only items with a url", () => {
		const wrapper = mount(RankedList, { props: { title: "Top Albums", items } });
		const rows = wrapper.findAll("li");
		expect(rows.map((r) => r.get(".fu-ranked__rank").text())).toEqual(["1", "2"]);
		expect(rows[0].get(".fu-ranked__count").text()).toBe((1204).toLocaleString());
		expect(rows[0].get("a").attributes("href")).toBe("https://example.com/a");
		expect(rows[1].find("a").exists()).toBe(false);
		expect(rows[0].get(".fu-ranked__subtitle").text()).toBe("Massive Attack");
		expect(rows[1].find(".fu-ranked__subtitle").exists()).toBe(false);
	});

	it("opens links in a new tab only when asked", () => {
		const plain = mount(RankedList, { props: { title: "T", items } }).get("a");
		expect(plain.attributes("target")).toBeUndefined();
		const newTab = mount(RankedList, { props: { title: "T", items, newTab: true } }).get("a");
		expect(newTab.attributes("target")).toBe("_blank");
		expect(newTab.attributes("rel")).toBe("noopener");
	});

	it("shows the empty text instead of an empty list, under the chosen heading level", () => {
		const wrapper = mount(RankedList, {
			props: { title: "Top Tracks", items: [], emptyText: "Nothing scrobbled in this range yet.", headingLevel: 2 },
		});
		expect(wrapper.find("ol").exists()).toBe(false);
		expect(wrapper.get("p").text()).toBe("Nothing scrobbled in this range yet.");
		expect(wrapper.get("h2").text()).toBe("Top Tracks");
	});
});
