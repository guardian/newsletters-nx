import type { LayoutSettings } from './newsletter-layout';
import { sameLayoutValue } from './newsletter-layout';

export type LayoutRow<T> = { id: number; value: T };

export type PreviewTarget =
	| { kind: 'hero' | 'caption' | 'bullets' }
	| { kind: 'footer'; email?: string }
	| { kind: 'breaking'; enabled: boolean }
	| {
			kind: 'heading';
			names: string[];
			beforeName?: string;
			group?: 'read-more' | 'automated-fronts';
	  };

export const targetsForField: Partial<
	Record<keyof LayoutSettings, PreviewTarget>
> = {
	displayDate: { kind: 'hero' },
	displayStandfirst: { kind: 'hero' },
	darkHeadlineBackground: { kind: 'hero' },
	paletteOverride: { kind: 'hero' },
	displayImageCaptions: { kind: 'caption' },
	bulletListStyle: { kind: 'bullets' },
};

export function diffLayoutRows<T>(
	before: Array<LayoutRow<T>>,
	after: Array<LayoutRow<T>>,
	getName: (value: T) => string,
	group?: 'read-more' | 'automated-fronts',
): PreviewTarget | undefined {
	const oldById = new Map(before.map((row) => [row.id, row]));
	const newById = new Map(after.map((row) => [row.id, row]));
	const removedAt = before.findIndex((row) => !newById.has(row.id));
	if (removedAt !== -1) {
		const neighbours = [
			...before.slice(removedAt + 1),
			...before.slice(0, removedAt).reverse(),
		].flatMap(({ id }) => {
			const survivor = newById.get(id);
			return survivor ? [getName(survivor.value)] : [];
		});
		// A removed style rule leaves its article heading in the email.
		const removed = before[removedAt];
		if (!group && removed) {
			neighbours.unshift(getName(removed.value));
		}
		return {
			kind: 'heading',
			group,
			names: neighbours,
			beforeName: removed ? getName(removed.value) : undefined,
		};
	}

	const changed = after.find(
		(row) => !sameLayoutValue(row.value, oldById.get(row.id)?.value),
	);
	if (!changed) {
		return undefined;
	}
	const old = oldById.get(changed.id);
	return {
		kind: 'heading',
		group,
		beforeName: old ? getName(old.value) : undefined,
		names:
			!group && old
				? [getName(changed.value), getName(old.value)]
				: [getName(changed.value)],
	};
}

const normalise = (value: string) =>
	value.trim().replace(/\s+/g, ' ').toLowerCase();
const headingSelector = 'h2, h3, h4, [role="heading"]';
const getHeadings = (root: Document | Element) =>
	Array.from(root.querySelectorAll(headingSelector));
const text = (element: Element) => normalise(element.textContent);

const uniqueHeading = (headings: Element[], name: string) => {
	const matches = headings.filter((node) => text(node) === normalise(name));
	return matches.length === 1 ? matches[0] : undefined;
};

const breakingLandmark = (document: Document) =>
	document.querySelector(
		'[data-preview-section="breaking-news"], .breaking-news',
	) ?? uniqueHeading(getHeadings(document), 'breaking news');

// The email renderer's generated breaking-news part looks like a normal “News”
// heading, but its header is followed by a LINK table. Confirm it was added or
// removed compared with the earlier email before treating it as breaking news.
const breakingNewsHeading = (document: Document) =>
	getHeadings(document).find(
		(heading) =>
			text(heading) === 'news' &&
			heading
				.closest('td.text-with-border')
				?.parentElement?.nextElementSibling?.querySelector('table.LINK'),
	);

const nearestHeading = (
	before: Document,
	removed: Element,
	after: Document,
) => {
	const oldHeadings = getHeadings(before);
	const at = oldHeadings.findIndex(
		(heading) => heading === removed || removed.contains(heading),
	);
	if (at === -1) {
		return undefined;
	}
	const heading = oldHeadings[at];
	const newHeadings = getHeadings(after);
	for (const neighbour of [
		...oldHeadings.slice(at + 1),
		...oldHeadings.slice(0, at).reverse(),
	]) {
		if (neighbour.tagName !== heading?.tagName) {
			continue;
		}
		const match = uniqueHeading(newHeadings, text(neighbour));
		if (match) {
			return match;
		}
	}
	return undefined;
};

export function findPreviewTarget(
	document: Document,
	target: PreviewTarget,
	previous?: Document,
): Element | undefined {
	switch (target.kind) {
		case 'hero':
			return (
				document.querySelector('.headline-text') ??
				document.querySelector('h1') ??
				undefined
			);
		case 'footer': {
			const links = Array.from(document.links).reverse();
			const contact = links.find(
				(link) =>
					link.getAttribute('href')?.startsWith('mailto:') &&
					(text(link) ===
						normalise(target.email ?? 'newsletters@theguardian.com') ||
						text(link.parentElement ?? link).includes(
							'about any of our newsletters',
						)),
			);
			return (
				document.querySelector('footer, [role="contentinfo"]') ??
				contact?.closest('div') ??
				contact ??
				links.find((link) => text(link) === 'unsubscribe')
			);
		}
		case 'caption': {
			// The email renderer puts captions in a table cell with a camera icon.
			const selector =
				'figcaption, .image-caption, [data-preview-section="caption"], td.text-with-border:has(> div > img[alt="camera"])';
			const caption = document.querySelector(selector);
			if (caption) {
				return caption;
			}
			const oldCaption = previous?.querySelector(selector);
			// With captions switched off, jump to the same image, not just any image.
			const src = (
				oldCaption?.closest('figure')?.querySelector('img') ??
				oldCaption
					?.closest('tr')
					?.previousElementSibling?.querySelector('img') ??
				oldCaption?.closest('table')?.querySelector('img')
			)?.getAttribute('src');
			return src
				? Array.from(document.images).find(
						(image) => image.getAttribute('src') === src,
					)
				: undefined;
		}
		case 'bullets':
			return (
				document.querySelector(
					'ul, .bullet-list, [data-preview-section="bullets"]',
				) ?? undefined
			);
		case 'breaking': {
			const explicit = breakingLandmark(document);
			if (explicit) {
				return explicit;
			}
			if (!previous) {
				return undefined;
			}
			const current = breakingNewsHeading(document);
			const old = breakingNewsHeading(previous);
			if (target.enabled) {
				return !old ? current : undefined;
			}
			const removed =
				breakingLandmark(previous) ?? (!current ? old : undefined);
			return removed ? nearestHeading(previous, removed, document) : undefined;
		}
		case 'heading': {
			const group = target.group
				? document.querySelector(`[data-preview-section="${target.group}"]`)
				: undefined;
			const headings = getHeadings(group ?? document);
			for (const name of target.names) {
				const match = normalise(name)
					? uniqueHeading(headings, name)
					: undefined;
				if (match) {
					return match;
				}
			}
			// Only use a container fallback after removing the last configured block.
			return target.names.length === 0 ? (group ?? undefined) : undefined;
		}
	}
}

export function findPreviousPreviewTarget(
	before: Document,
	after: Document,
	target: PreviewTarget,
): Element | undefined {
	if (target.kind === 'breaking') {
		return breakingLandmark(before) ?? breakingNewsHeading(before);
	}
	return findPreviewTarget(
		before,
		target.kind === 'heading' && target.beforeName
			? { ...target, names: [target.beforeName, ...target.names] }
			: target,
		after,
	);
}
