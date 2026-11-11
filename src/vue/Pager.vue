<script setup>
import { computed } from "vue";

const props = defineProps({
	/** Current page, 1-based (Astro's `page.currentPage`). */
	page: { type: Number, required: true },
	/** Number of pages (Astro's `page.lastPage`). Nothing renders when it's 1 or less. */
	pages: { type: Number, required: true },
	/** Link to the previous page. Passing either href renders links instead of buttons. */
	prevHref: { type: String, default: undefined },
	/** Link to the next page. */
	nextHref: { type: String, default: undefined },
	/** Visible text of the previous step; the arrow is added and hidden from screen readers. */
	prevText: { type: String, default: "Previous" },
	/** Visible text of the next step. */
	nextText: { type: String, default: "Next" },
	/** Accessible name of the nav or group. */
	label: { type: String, default: "Pages" },
});
const emit = defineEmits(["update:page"]);

const links = computed(() => props.prevHref != null || props.nextHref != null);
const atStart = computed(() => props.page <= 1);
const atEnd = computed(() => props.page >= props.pages);

function go(to, blocked) {
	if (!blocked) emit("update:page", to);
}
</script>

<template>
	<nav v-if="pages > 1 && links" class="fu-pager" :aria-label="label">
		<a v-if="prevHref" class="fu-pager__step fu-pager__step--prev" :href="prevHref" rel="prev"><span class="fu-pager__arrow" aria-hidden="true">←</span>{{ prevText }}</a>
		<span class="fu-pager__label">Page {{ page }} of {{ pages }}</span>
		<a v-if="nextHref" class="fu-pager__step fu-pager__step--next" :href="nextHref" rel="next">{{ nextText }}<span class="fu-pager__arrow" aria-hidden="true">→</span></a>
	</nav>
	<div v-else-if="pages > 1" class="fu-pager" role="group" :aria-label="label">
		<button type="button" class="fu-pager__step fu-pager__step--prev" :aria-disabled="atStart ? 'true' : undefined" @click="go(page - 1, atStart)"><span class="fu-pager__arrow" aria-hidden="true">←</span>{{ prevText }}</button>
		<span class="fu-pager__label">Page {{ page }} of {{ pages }}</span>
		<button type="button" class="fu-pager__step fu-pager__step--next" :aria-disabled="atEnd ? 'true' : undefined" @click="go(page + 1, atEnd)">{{ nextText }}<span class="fu-pager__arrow" aria-hidden="true">→</span></button>
	</div>
</template>

<style>
@layer components {
	/* Steps sit at the ends and the label in the middle, even when a link mode leaves one step out.
	   The label wraps rather than the steps when a phone is too narrow for all three. */
	.fu-pager {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: 0.75rem;
		font-size: 0.875rem;
	}
	.fu-pager__label {
		grid-column: 2;
		color: var(--color-muted);
		font-variant-numeric: tabular-nums;
		text-align: center;
	}
	.fu-pager__step {
		appearance: none;
		margin: 0;
		font: inherit;
		color: var(--color-ink);
		padding: 0.5rem 0;
		background: transparent;
		border: 0;
		cursor: pointer;
		text-decoration: none;
		text-underline-offset: 0.2em;
		white-space: nowrap;
		transition:
			color var(--duration-ui) ease-out,
			transform var(--duration-ui) ease-out;
	}
	.fu-pager__step--prev {
		grid-column: 1;
		justify-self: start;
	}
	.fu-pager__step--next {
		grid-column: 3;
		justify-self: end;
	}
	/* inline-block keeps the underline off the arrow, so the arrow can move on its own.
	   FOOTGUN: space it with a margin, not a space character, or the hover underline runs under the gap. */
	.fu-pager__arrow {
		display: inline-block;
		transition: transform var(--duration-ui) ease-out;
	}
	.fu-pager__step--prev .fu-pager__arrow {
		margin-inline-end: 0.4em;
	}
	.fu-pager__step--next .fu-pager__arrow {
		margin-inline-start: 0.4em;
	}
	.fu-pager__step:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
	/* aria-disabled, not disabled: a disabled button drops focus when Next reaches the last page. */
	.fu-pager__step[aria-disabled="true"] {
		cursor: not-allowed;
		opacity: 0.45;
	}

	/* Borderless, like furioursus.dev's links: hover is pink with a 2px underline and the arrow steps out. */
	.fu-pager__step:where(:hover:not([aria-disabled="true"])) {
		color: var(--color-accent);
		text-decoration: underline 2px;
	}
	.fu-pager__step--prev:where(:hover:not([aria-disabled="true"])) .fu-pager__arrow {
		transform: translateX(-3px);
	}
	.fu-pager__step--next:where(:hover:not([aria-disabled="true"])) .fu-pager__arrow {
		transform: translateX(3px);
	}
	.fu-pager__step:where(:active:not([aria-disabled="true"])) {
		transform: translateY(1px);
	}

	@media (prefers-reduced-motion: reduce) {
		.fu-pager__step,
		.fu-pager__arrow {
			transition: none;
		}
	}
}
</style>
