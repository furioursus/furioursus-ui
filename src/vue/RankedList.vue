<script setup>
defineProps({
	/** Heading above the list, e.g. "Top Albums". */
	title: { type: String, required: true },
	/** Heading level for the title. */
	headingLevel: { type: Number, default: 3, validator: (n) => n >= 2 && n <= 6 },
	/** Rows in rank order: `{ name, subtitle?, count, url? }`. `count` is shown with the reader's locale. */
	items: { type: Array, required: true },
	/** Shown instead of the list when `items` is empty. */
	emptyText: { type: String, default: "Nothing here yet." },
	/** Open links in a new tab (for lists pointing at other sites). */
	newTab: { type: Boolean, default: false },
});
</script>

<template>
	<div class="fu-ranked">
		<component :is="`h${headingLevel}`" class="fu-ranked__title">{{ title }}</component>
		<p v-if="items.length === 0" class="fu-ranked__empty">{{ emptyText }}</p>
		<ol v-else class="fu-ranked__list">
			<li v-for="(item, index) in items" :key="`${index}-${item.name}`" class="fu-ranked__row">
				<span class="fu-ranked__rank" aria-hidden="true">{{ index + 1 }}</span>
				<component
					:is="item.url ? 'a' : 'span'"
					class="fu-ranked__item"
					:href="item.url || undefined"
					:target="item.url && newTab ? '_blank' : undefined"
					:rel="item.url && newTab ? 'noopener' : undefined"
				>
					<span class="fu-ranked__name">{{ item.name }}</span>
					<span v-if="item.subtitle" class="fu-ranked__subtitle">{{ item.subtitle }}</span>
				</component>
				<span class="fu-ranked__count">{{ Number(item.count).toLocaleString() }}</span>
			</li>
		</ol>
	</div>
</template>

<style>
@layer components {
	/* FOOTGUN: min-width 0 lets the list sit in a grid column without growing to its longest name. */
	.fu-ranked {
		min-width: 0;
	}
	.fu-ranked__title {
		margin: 0 0 0.5rem;
		font-size: var(--text-2xs);
		font-weight: 400;
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
		opacity: 0.7;
	}
	.fu-ranked__empty {
		margin: 0;
		font-size: var(--text-2xs);
		opacity: 0.6;
	}
	.fu-ranked__list {
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.fu-ranked__row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: var(--spacing-tight-4) 0;
		border-bottom: 1px solid var(--color-muted);
	}
	.fu-ranked__row:last-child {
		border-bottom: 0;
	}
	.fu-ranked__rank,
	.fu-ranked__count {
		flex: none;
		font-size: 0.75rem;
		line-height: calc(1 / 0.75);
	}
	.fu-ranked__rank {
		width: 1.25rem;
		text-align: right;
		opacity: 0.5;
	}
	.fu-ranked__count {
		opacity: 0.6;
	}
	/* Rows reserve two lines (name + subtitle), so lists with and without subtitles line up side by side. */
	.fu-ranked__item {
		display: flex;
		flex: 1;
		flex-direction: column;
		justify-content: center;
		min-width: 0;
		min-height: calc(0.85rem * 1.3 + 0.75rem * 1.3);
		color: inherit;
		text-decoration: none;
	}
	.fu-ranked__name,
	.fu-ranked__subtitle {
		overflow: hidden;
		line-height: 1.3;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.fu-ranked__name {
		font-size: 0.85rem;
	}
	.fu-ranked__subtitle {
		font-size: 0.75rem;
		opacity: 0.6;
	}
	a.fu-ranked__item:hover .fu-ranked__name {
		color: var(--color-accent);
	}
	a.fu-ranked__item:focus-visible {
		outline: 2px solid var(--color-accent);
		outline-offset: 2px;
	}
}
</style>
