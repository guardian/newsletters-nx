import { describe, expect, it } from 'vitest';
import type { NewsletterRow } from './all-newsletters-rows';
import { splitHomeRows } from './home-rows';

const row = (kind: NewsletterRow['kind'], n: number): NewsletterRow => ({
	id: `${kind}-${n}`,
	kind,
	href: `/${kind}/${n}`,
	name: `${kind} ${n}`,
	statusBadge: { label: 'Live', color: 'green' },
});

describe('splitHomeRows', () => {
	it('keeps only draft newsletters in the drafts list, in order', () => {
		const { drafts } = splitHomeRows([
			row('draft', 1),
			row('launched', 1),
			row('draft', 2),
		]);
		expect(drafts.map((r) => r.id)).toEqual(['draft-1', 'draft-2']);
	});

	it('does not cap drafts', () => {
		const rows = Array.from({ length: 30 }, (_, i) => row('draft', i + 1));
		expect(splitHomeRows(rows).drafts).toHaveLength(30);
	});
});
