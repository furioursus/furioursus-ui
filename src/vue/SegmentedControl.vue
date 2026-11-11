<script setup>
import "./segments.css";

defineProps({
	/**
	 * The choices, in order: `{ value, label, count?, disabled?, title?, attrs? }`. `count` shows muted after
	 * the label ("All 12"); `attrs` go on that option's button (data attributes, say).
	 */
	options: { type: Array, required: true },
	/** The pressed option's `value` (use `v-model`). A value no option has presses none. */
	modelValue: { type: [String, Number, Boolean], default: undefined },
	/** Accessible name of the group, e.g. "Show". */
	label: { type: String, required: true },
});
defineEmits(["update:modelValue"]);
</script>

<template>
	<div role="group" :aria-label="label" class="fu-seg">
		<button
			v-for="option in options"
			:key="String(option.value)"
			type="button"
			class="fu-seg__btn"
			v-bind="option.attrs"
			:aria-pressed="String(option.value === modelValue)"
			:disabled="option.disabled || undefined"
			:title="option.title"
			@click="$emit('update:modelValue', option.value)"
		>{{ option.label }}<template v-if="option.count != null">{{ " " }}<span class="fu-seg__count">{{ option.count }}</span></template></button>
	</div>
</template>
