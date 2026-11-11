import { Fragment, computed, createBlock, createCommentVNode, createElementBlock, createElementVNode, createStaticVNode, createTextVNode, mergeProps, onBeforeUnmount, onMounted, openBlock, ref, renderList, resolveDynamicComponent, toDisplayString, withCtx } from "vue";
// src/vue/Pager.vue
var _hoisted_1$4 = ["aria-label"];
var _hoisted_2$4 = ["href"];
var _hoisted_3$2 = { class: "fu-pager__label" };
var _hoisted_4$1 = ["href"];
var _hoisted_5$1 = ["aria-label"];
var _hoisted_6$1 = ["aria-disabled"];
var _hoisted_7$1 = { class: "fu-pager__label" };
var _hoisted_8 = ["aria-disabled"];
var _sfc_main = {
	__name: "Pager",
	props: {
		/** Current page, 1-based (Astro's `page.currentPage`). */
		page: {
			type: Number,
			required: true
		},
		/** Number of pages (Astro's `page.lastPage`). Nothing renders when it's 1 or less. */
		pages: {
			type: Number,
			required: true
		},
		/** Link to the previous page. Passing either href renders links instead of buttons. */
		prevHref: {
			type: String,
			default: void 0
		},
		/** Link to the next page. */
		nextHref: {
			type: String,
			default: void 0
		},
		/** Visible text of the previous step; the arrow is added and hidden from screen readers. */
		prevText: {
			type: String,
			default: "Previous"
		},
		/** Visible text of the next step. */
		nextText: {
			type: String,
			default: "Next"
		},
		/** Accessible name of the nav or group. */
		label: {
			type: String,
			default: "Pages"
		}
	},
	emits: ["update:page"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const links = computed(() => props.prevHref != null || props.nextHref != null);
		const atStart = computed(() => props.page <= 1);
		const atEnd = computed(() => props.page >= props.pages);
		function go(to, blocked) {
			if (!blocked) emit("update:page", to);
		}
		return (_ctx, _cache) => {
			return __props.pages > 1 && links.value ? (openBlock(), createElementBlock("nav", {
				key: 0,
				class: "fu-pager",
				"aria-label": __props.label
			}, [
				__props.prevHref ? (openBlock(), createElementBlock("a", {
					key: 0,
					class: "fu-pager__step fu-pager__step--prev",
					href: __props.prevHref,
					rel: "prev"
				}, [_cache[2] || (_cache[2] = createElementVNode("span", {
					class: "fu-pager__arrow",
					"aria-hidden": "true"
				}, "←", -1)), createTextVNode(" " + toDisplayString(__props.prevText), 1)], 8, _hoisted_2$4)) : createCommentVNode("", true),
				createElementVNode("span", _hoisted_3$2, "Page " + toDisplayString(__props.page) + " of " + toDisplayString(__props.pages), 1),
				__props.nextHref ? (openBlock(), createElementBlock("a", {
					key: 1,
					class: "fu-pager__step fu-pager__step--next",
					href: __props.nextHref,
					rel: "next"
				}, [createTextVNode(toDisplayString(__props.nextText) + " ", 1), _cache[3] || (_cache[3] = createElementVNode("span", {
					class: "fu-pager__arrow",
					"aria-hidden": "true"
				}, "→", -1))], 8, _hoisted_4$1)) : createCommentVNode("", true)
			], 8, _hoisted_1$4)) : __props.pages > 1 ? (openBlock(), createElementBlock("div", {
				key: 1,
				class: "fu-pager",
				role: "group",
				"aria-label": __props.label
			}, [
				createElementVNode("button", {
					type: "button",
					class: "fu-pager__step fu-pager__step--prev",
					"aria-disabled": atStart.value ? "true" : void 0,
					onClick: _cache[0] || (_cache[0] = ($event) => go(__props.page - 1, atStart.value))
				}, [_cache[4] || (_cache[4] = createElementVNode("span", {
					class: "fu-pager__arrow",
					"aria-hidden": "true"
				}, "←", -1)), createTextVNode(" " + toDisplayString(__props.prevText), 1)], 8, _hoisted_6$1),
				createElementVNode("span", _hoisted_7$1, "Page " + toDisplayString(__props.page) + " of " + toDisplayString(__props.pages), 1),
				createElementVNode("button", {
					type: "button",
					class: "fu-pager__step fu-pager__step--next",
					"aria-disabled": atEnd.value ? "true" : void 0,
					onClick: _cache[1] || (_cache[1] = ($event) => go(__props.page + 1, atEnd.value))
				}, [createTextVNode(toDisplayString(__props.nextText) + " ", 1), _cache[5] || (_cache[5] = createElementVNode("span", {
					class: "fu-pager__arrow",
					"aria-hidden": "true"
				}, "→", -1))], 8, _hoisted_8)
			], 8, _hoisted_5$1)) : createCommentVNode("", true);
		};
	}
};
// src/vue/PeriodTabs.vue
var _hoisted_1$3 = ["aria-label"];
var _hoisted_2$3 = [
	"id",
	"aria-controls",
	"aria-selected",
	"tabindex",
	"onClick",
	"onKeydown"
];
var _sfc_main$1 = {
	__name: "PeriodTabs",
	props: {
		/** The choices, in order: `{ value, label }`. */
		options: {
			type: Array,
			required: true
		},
		/** The selected option's `value` (use `v-model`). Defaults to the first option. */
		modelValue: {
			type: [String, Number],
			default: void 0
		},
		/** Accessible name of the tab list, e.g. "Time range". */
		label: {
			type: String,
			required: true
		},
		/**
		* Links each tab to its panel: tab `${idPrefix}-tab-${value}` controls `${idPrefix}-panel-${value}`.
		* Give your panels those ids and `aria-labelledby` the tab. Omit it when the tabs only filter one view.
		*/
		idPrefix: {
			type: String,
			default: void 0
		}
	},
	emits: ["update:modelValue"],
	setup(__props, { emit: __emit }) {
		const props = __props;
		const emit = __emit;
		const selected = computed(() => props.modelValue ?? props.options[0]?.value);
		const tabs = ref([]);
		const select = (index, focus = false) => {
			const option = props.options[index];
			if (!option) return;
			emit("update:modelValue", option.value);
			if (focus) tabs.value[index]?.focus();
		};
		const onKeydown = (event, index) => {
			const last = props.options.length - 1;
			const next = {
				ArrowRight: index === last ? 0 : index + 1,
				ArrowLeft: index === 0 ? last : index - 1,
				Home: 0,
				End: last
			}[event.key];
			if (next === void 0) return;
			event.preventDefault();
			select(next, true);
		};
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				role: "tablist",
				"aria-label": __props.label,
				class: "fu-tabs"
			}, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.options, (option, index) => {
				return openBlock(), createElementBlock("button", {
					key: option.value,
					ref_for: true,
					ref_key: "tabs",
					ref: tabs,
					type: "button",
					role: "tab",
					class: "fu-tabs__tab",
					id: __props.idPrefix ? `${__props.idPrefix}-tab-${option.value}` : void 0,
					"aria-controls": __props.idPrefix ? `${__props.idPrefix}-panel-${option.value}` : void 0,
					"aria-selected": option.value === selected.value,
					tabindex: option.value === selected.value ? 0 : -1,
					onClick: ($event) => select(index),
					onKeydown: ($event) => onKeydown($event, index)
				}, toDisplayString(option.label), 41, _hoisted_2$3);
			}), 128))], 8, _hoisted_1$3);
		};
	}
};
// src/vue/RankedList.vue
var _hoisted_1$2 = { class: "fu-ranked" };
var _hoisted_2$2 = {
	key: 0,
	class: "fu-ranked__empty"
};
var _hoisted_3$1 = {
	key: 1,
	class: "fu-ranked__list"
};
var _hoisted_4 = {
	class: "fu-ranked__rank",
	"aria-hidden": "true"
};
var _hoisted_5 = { class: "fu-ranked__name" };
var _hoisted_6 = {
	key: 0,
	class: "fu-ranked__subtitle"
};
var _hoisted_7 = { class: "fu-ranked__count" };
var _sfc_main$2 = {
	__name: "RankedList",
	props: {
		/** Heading above the list, e.g. "Top Albums". */
		title: {
			type: String,
			required: true
		},
		/** Heading level for the title. */
		headingLevel: {
			type: Number,
			default: 3,
			validator: (n) => n >= 2 && n <= 6
		},
		/** Rows in rank order: `{ name, subtitle?, count, url? }`. `count` is shown with the reader's locale. */
		items: {
			type: Array,
			required: true
		},
		/** Shown instead of the list when `items` is empty. */
		emptyText: {
			type: String,
			default: "Nothing here yet."
		},
		/** Open links in a new tab (for lists pointing at other sites). */
		newTab: {
			type: Boolean,
			default: false
		}
	},
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", _hoisted_1$2, [(openBlock(), createBlock(resolveDynamicComponent(`h${__props.headingLevel}`), { class: "fu-ranked__title" }, {
				default: withCtx(() => [createTextVNode(toDisplayString(__props.title), 1)]),
				_: 1
			})), __props.items.length === 0 ? (openBlock(), createElementBlock("p", _hoisted_2$2, toDisplayString(__props.emptyText), 1)) : (openBlock(), createElementBlock("ol", _hoisted_3$1, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.items, (item, index) => {
				return openBlock(), createElementBlock("li", {
					key: `${index}-${item.name}`,
					class: "fu-ranked__row"
				}, [
					createElementVNode("span", _hoisted_4, toDisplayString(index + 1), 1),
					(openBlock(), createBlock(resolveDynamicComponent(item.url ? "a" : "span"), {
						class: "fu-ranked__item",
						href: item.url || void 0,
						target: item.url && __props.newTab ? "_blank" : void 0,
						rel: item.url && __props.newTab ? "noopener" : void 0
					}, {
						default: withCtx(() => [createElementVNode("span", _hoisted_5, toDisplayString(item.name), 1), item.subtitle ? (openBlock(), createElementBlock("span", _hoisted_6, toDisplayString(item.subtitle), 1)) : createCommentVNode("", true)]),
						_: 2
					}, 1032, [
						"href",
						"target",
						"rel"
					])),
					createElementVNode("span", _hoisted_7, toDisplayString(Number(item.count).toLocaleString()), 1)
				]);
			}), 128))]))]);
		};
	}
};
// src/vue/SegmentedControl.vue
var _hoisted_1$1 = ["aria-label"];
var _hoisted_2$1 = [
	"aria-pressed",
	"disabled",
	"title",
	"onClick"
];
var _hoisted_3 = { class: "fu-seg__count" };
var _sfc_main$3 = {
	__name: "SegmentedControl",
	props: {
		/**
		* The choices, in order: `{ value, label, count?, disabled?, title?, attrs? }`. `count` shows muted after
		* the label ("All 12"); `attrs` go on that option's button (data attributes, say).
		*/
		options: {
			type: Array,
			required: true
		},
		/** The pressed option's `value` (use `v-model`). A value no option has presses none. */
		modelValue: {
			type: [
				String,
				Number,
				Boolean
			],
			default: void 0
		},
		/** Accessible name of the group, e.g. "Show". */
		label: {
			type: String,
			required: true
		}
	},
	emits: ["update:modelValue"],
	setup(__props) {
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("div", {
				role: "group",
				"aria-label": __props.label,
				class: "fu-seg"
			}, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.options, (option) => {
				return openBlock(), createElementBlock("button", mergeProps({
					key: String(option.value),
					type: "button",
					class: "fu-seg__btn"
				}, { ref_for: true }, option.attrs, {
					"aria-pressed": String(option.value === __props.modelValue),
					disabled: option.disabled || void 0,
					title: option.title,
					onClick: ($event) => _ctx.$emit("update:modelValue", option.value)
				}), [createTextVNode(toDisplayString(option.label), 1), option.count != null ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [_cache[0] || (_cache[0] = createTextVNode(toDisplayString(" "), -1)), createElementVNode("span", _hoisted_3, toDisplayString(option.count), 1)], 64)) : createCommentVNode("", true)], 16, _hoisted_2$1);
			}), 128))], 8, _hoisted_1$1);
		};
	}
};
// src/vue/ThemeToggle.vue
var _hoisted_1 = ["aria-checked", "title"];
var _hoisted_2 = { class: "fu-sr-only" };
var _sfc_main$4 = {
	__name: "ThemeToggle",
	props: { 
	/** Accessible name of the switch, read with its on/off state. */
label: {
		type: String,
		default: "Dark theme"
	} },
	setup(__props) {
		const dark = ref(false);
		const sync = () => {
			dark.value = document.documentElement.getAttribute("data-theme") === "dark";
		};
		onMounted(() => {
			sync();
			document.addEventListener("theme-changed", sync);
		});
		onBeforeUnmount(() => document.removeEventListener("theme-changed", sync));
		return (_ctx, _cache) => {
			return openBlock(), createElementBlock("button", {
				type: "button",
				role: "switch",
				"data-theme-toggle": "",
				"aria-checked": dark.value,
				class: "fu-theme-toggle",
				title: dark.value ? "Switch to light mode" : "Switch to dark mode"
			}, [createElementVNode("span", _hoisted_2, toDisplayString(__props.label), 1), _cache[0] || (_cache[0] = createStaticVNode("<svg class=\"fu-theme-toggle__icon fu-theme-toggle__sun\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" aria-hidden=\"true\"><path d=\"M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z\"></path><path d=\"M22 12L23 12M12 2V1M12 23V22M20 20L19 19M20 4L19 5M4 20L5 19M4 4L5 5M1 12L2 12\"></path></svg><svg class=\"fu-theme-toggle__icon fu-theme-toggle__moon\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" aria-hidden=\"true\"><path d=\"M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z\"></path><path d=\"M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2\"></path><path d=\"M19 11h2m-1 -1v2\"></path></svg>", 2))], 8, _hoisted_1);
		};
	}
};
export { _sfc_main as Pager, _sfc_main$1 as PeriodTabs, _sfc_main$2 as RankedList, _sfc_main$3 as SegmentedControl, _sfc_main$4 as ThemeToggle };
