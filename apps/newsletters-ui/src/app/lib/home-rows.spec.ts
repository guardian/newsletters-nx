import { describe, expect, it } from 'vitest';
import type { NewsletterRow } from './all-newsletters-rows';
import { LAUNCHED_LIMIT, splitHomeRows } from './home-rows';

const row = (kind: NewsletterRow['kind'], n: number): NewsletterRow => ({
	id: `${kind}-${n}`,
	kind,
	href: `/${kind}/${n}`,
	name: `${kind} ${n}`,
	statusBadge: { label: 'Live', color: 'green' },
});

const many = (kind: NewsletterRow['kind'], count: number) =>
	Array.from({ length: count }, (_, i) => row(kind, i + 1));

describe('splitHomeRows', () => {
	it('puts each kind of newsletter in its own list', () => {
		const { drafts, launched } = splitHomeRows([
			row('draft', 1),
			row('launched', 1),
		]);
		expect(drafts.map((r) => r.id)).toEqual(['draft-1']);
		expect(launched.map((r) => r.id)).toEqual(['launched-1']);
	});

	it('caps launched newsletters, keeping the most recently updated', () => {
		const { launched } = splitHomeRows(many('launched', LAUNCHED_LIMIT + 1));
		expect(launched).toHaveLength(LAUNCHED_LIMIT);
		expect(launched[0]?.id).toBe('launched-1');
		expect(launched.at(-1)?.id).toBe(`launched-${LAUNCHED_LIMIT}`);
	});

	it('does not cap drafts', () => {
		const { drafts } = splitHomeRows(many('draft', LAUNCHED_LIMIT + 1));
		expect(drafts).toHaveLength(LAUNCHED_LIMIT + 1);
	});
});
