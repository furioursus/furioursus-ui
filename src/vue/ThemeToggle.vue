<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

defineProps({
	/** Accessible name of the switch, read with its on/off state. */
	label: { type: String, default: "Dark theme" },
});

// theme.js handles the click (via data-theme-toggle) and keeps aria-checked and title in sync, so this works
// rendered statically with no hydration. FOOTGUN: don't add a click handler here; theme.js would flip twice.
// Hydrated, it follows theme-changed so Vue's own render agrees with what theme.js set.
const dark = ref(false);
const sync = () => {
	dark.value = document.documentElement.getAttribute("data-theme") === "dark";
};

onMounted(() => {
	sync();
	document.addEventListener("theme-changed", sync);
});
onBeforeUnmount(() => document.removeEventListener("theme-changed", sync));
</script>

<template>
	<button
		type="button"
		role="switch"
		data-theme-toggle
		:aria-checked="dark"
		class="fu-theme-toggle"
		:title="dark ? 'Switch to light mode' : 'Switch to dark mode'"
	>
		<span class="fu-sr-only">{{ label }}</span>
		<svg
			class="fu-theme-toggle__icon fu-theme-toggle__sun"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path
				d="M12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18Z"
			/>
			<path d="M22 12L23 12M12 2V1M12 23V22M20 20L19 19M20 4L19 5M4 20L5 19M4 4L5 5M1 12L2 12" />
		</svg>
		<svg
			class="fu-theme-toggle__icon fu-theme-toggle__moon"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="1.5"
			aria-hidden="true"
		>
			<path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
			<path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
			<path d="M19 11h2m-1 -1v2" />
		</svg>
	</button>
</template>

<style>
@layer components {
	.fu-sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	/* A borderless 36px button; the sun and moon cross-fade and scale on a theme switch. */
	.fu-theme-toggle {
		appearance: none;
		margin: 0;
		font: inherit;
		color: var(--color-ink);
		background: transparent;
		cursor: pointer;
		position: relative;
		width: 2.25rem;
		height: 2.25rem;
		padding: 0.5rem;
		border: 0;
		transition:
			color 150ms cubic-bezier(0.4, 0, 0.2, 1),
			transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
	}
	/* Hover thickens the strokes as well as turning pink: a state is never color alone (docs/components.md). */
	.fu-theme-toggle:hover {
		color: var(--color-accent);
	}
	.fu-theme-toggle:hover .fu-theme-toggle__icon {
		stroke-width: 2;
	}
	.fu-theme-toggle:active {
		transform: translateY(1px);
	}
	.fu-theme-toggle:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 1px;
	}
	.fu-theme-toggle__icon {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 1.75rem;
		height: 1.75rem;
		translate: -50% -50%;
		transition:
			scale 150ms cubic-bezier(0.4, 0, 0.2, 1),
			opacity 150ms cubic-bezier(0.4, 0, 0.2, 1),
			stroke-width 150ms cubic-bezier(0.4, 0, 0.2, 1);
	}
	.fu-theme-toggle__moon,
	:root[data-theme="dark"] .fu-theme-toggle__sun {
		scale: 0;
		opacity: 0;
	}
	:root[data-theme="dark"] .fu-theme-toggle__moon {
		scale: 1;
		opacity: 1;
	}
	/* Same rule as tokens.css: with no data-theme (no JS yet), follow the system. */
	@media (prefers-color-scheme: dark) {
		:root:not([data-theme]) .fu-theme-toggle__sun {
			scale: 0;
			opacity: 0;
		}
		:root:not([data-theme]) .fu-theme-toggle__moon {
			scale: 1;
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.fu-theme-toggle,
		.fu-theme-toggle__icon {
			transition: none;
		}
	}
}
</style>
