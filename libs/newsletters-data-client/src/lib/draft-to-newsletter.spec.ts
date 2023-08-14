import {
	defaultRenderingOptionsValues,
	getDraftNotReadyIssues,
	withDefaultNewsletterValuesAndDerivedFields,
} from '..';
import { TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS } from '../fixtures/newsletter-fixtures';

describe('withDefaultNewsletterValuesAndDerivedFields', () => {
	it('sets status to pending by default', () => {
		const fromEmpty = withDefaultNewsletterValuesAndDerivedFields({});
		expect(fromEmpty.status).toBe('pending');
	});

	it('derives the identity name from the name, unless identity name is set', () => {
		const withDerivedId = withDefaultNewsletterValuesAndDerivedFields({
			name: 'The Day Today',
		});
		const withPresetId = withDefaultNewsletterValuesAndDerivedFields({
			name: 'The Day Today',
			identityName: 'on-the-hour',
		});
		expect(withDerivedId.identityName).toBe('the-day-today');
		expect(withPresetId.identityName).toBe('on-the-hour');
	});

	it('will merge the default rendering options, if the draft has renderingOptions,', () => {
		const fromEmptyRenderingOptions =
			withDefaultNewsletterValuesAndDerivedFields({
				name: 'The Day Today',
				renderingOptions: {},
			});

		const partialRenderingOptions = {
			displayDate: true,
			darkThemeSubheading: ['sports desk'],
		};

		const fromPartialRenderingOptions =
			withDefaultNewsletterValuesAndDerivedFields({
				name: 'The Day Today',
				renderingOptions: partialRenderingOptions,
			});

		expect(fromEmptyRenderingOptions.renderingOptions).toEqual({
			...defaultRenderingOptionsValues,
		});
		expect(fromPartialRenderingOptions.renderingOptions).toEqual({
			...defaultRenderingOptionsValues,
			...partialRenderingOptions,
		});
	});

	it('will add the default rendering options if the rendering options are undefined, but only when category is article-based', () => {
		const fromEmptyFrontsBased = withDefaultNewsletterValuesAndDerivedFields({
			name: 'The Day Today',
			category: 'fronts-based',
		});
		const fromEmptyArticleBased = withDefaultNewsletterValuesAndDerivedFields({
			name: 'The Day Today',
			category: 'article-based',
		});

		expect(fromEmptyFrontsBased.renderingOptions).toEqual(undefined);
		expect(fromEmptyArticleBased.renderingOptions).toEqual(
			defaultRenderingOptionsValues,
		);
	});
});

describe('getDraftNotReadyIssues', () => {
	it('will find no errors on a draft satisfying the data collection schema', () => {
		const outcome = getDraftNotReadyIssues(
			TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS,
		);
		expect(outcome).toEqual([]);
	});
	it('will report missing required fields', () => {
		const outcomeWhenNameMissing = getDraftNotReadyIssues({
			...TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS,
			name: undefined,
		});
		expect(outcomeWhenNameMissing[0]?.path).toEqual(['name']);

		const outcomeWhenThemeMissing = getDraftNotReadyIssues({
			...TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS,
			theme: undefined,
		});
		expect(outcomeWhenThemeMissing[0]?.path).toEqual(['theme']);

		const outcomeWhenBothMissing = getDraftNotReadyIssues({
			...TECHSCAPE_IN_NEW_FORMAT_WITH_DATA_COLLECTION_FIELDS,
			name: undefined,
			theme: undefined,
		});
		expect(outcomeWhenBothMissing.length).toEqual(2);
	});
});
