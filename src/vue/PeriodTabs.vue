<script setup>
import { computed, ref } from "vue";
import "./segments.css";

const props = defineProps({
	/** The choices, in order: `{ value, label }`. */
	options: { type: Array, required: true },
	/** The selected option's `value` (use `v-model`). Defaults to the first option. */
	modelValue: { type: [String, Number], default: undefined },
	/** Accessible name of the tab list, e.g. "Time range". */
	label: { type: String, required: true },
	/**
	 * Links each tab to its panel: tab `${idPrefix}-tab-${value}` controls `${idPrefix}-panel-${value}`.
	 * Give your panels those ids and `aria-labelledby` the tab. Omit it when the tabs only filter one view.
	 */
	idPrefix: { type: String, default: undefined },
});
const emit = defineEmits(["update:modelValue"]);

const selected = computed(() => props.modelValue ?? props.options[0]?.value);
const tabs = ref([]);

const select = (index, focus = false) => {
	const option = props.options[index];
	if (!option) return;
	emit("update:modelValue", option.value);
	if (focus) tabs.value[index]?.focus();
};

// Automatic activation: arrows move focus and select, wrapping at the ends (ARIA tabs pattern).
const onKeydown = (event, index) => {
	const last = props.options.length - 1;
	const next = {
		ArrowRight: index === last ? 0 : index + 1,
		ArrowLeft: index === 0 ? last : index - 1,
		Home: 0,
		End: last,
	}[event.key];
	if (next === undefined) return;
	event.preventDefault();
	select(next, true);
};
</script>

<template>
	<div role="tablist" :aria-label="label" class="fu-tabs">
		<button
			v-for="(option, index) in options"
			:key="option.value"
			ref="tabs"
			type="button"
			role="tab"
			class="fu-tabs__tab"
			:id="idPrefix ? `${idPrefix}-tab-${option.value}` : undefined"
			:aria-controls="idPrefix ? `${idPrefix}-panel-${option.value}` : undefined"
			:aria-selected="option.value === selected"
			:tabindex="option.value === selected ? 0 : -1"
			@click="select(index)"
			@keydown="onKeydown($event, index)"
		>
			{{ option.label }}
		</button>
	</div>
</template>
