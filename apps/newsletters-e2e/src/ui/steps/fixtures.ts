import { test as base, createBdd } from 'playwright-bdd';
import { deleteDraftNewsletter } from '../../../helpers/draft-newsletter';

/**
 * Per-scenario mutable state, shared between step definitions for a single
 * test. Playwright creates a fresh fixture instance for every test, so this
 * is safe even when scenarios run in parallel.
 */
interface DraftWorld {
	listId?: number;
}

type Fixtures = {
	draftWorld: DraftWorld;
};

export const test = base.extend<Fixtures>({
	draftWorld: async ({ request }, use) => {
		const world: DraftWorld = {};
		await use(world);
		if (world.listId) {
			await deleteDraftNewsletter(request, world.listId).catch(() => {
				// Best-effort cleanup only; ignore if already removed.
			});
		}
	},
});

export const { Given, When, Then } = createBdd(test);
