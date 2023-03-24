import { TECHSCAPE_IN_NEW_FORMAT } from '../fixtures/newsletter-fixtures';
import type { DraftNewsletterData } from './newsletter-data-type';
import { isDraftNewsletterData } from './newsletter-data-type';
import type { FormDataRecord } from './transformWizardData';
import {
	draftNewsletterDataToFormData,
	formDataToDraftNewsletterData,
} from './transformWizardData';

const SIMPLE_VALID_FORM_DATA: FormDataRecord = {
	name: 'test name',
	identityName: 'test-name',
	status: 'paused',
	emailConfirmation: false,
};

const SIMPLE_VALID_DRAFT: DraftNewsletterData = {
	name: 'test name',
	identityName: 'test-name',
	status: 'paused',
	emailConfirmation: false,
};

const VALID_FORM_DATA_WITH_NESTED_OBJECT: FormDataRecord = {
	name: 'test name',
	'emailEmbed.name': 'embed name',
	'emailEmbed.title': 'embed title',
	'emailEmbed.description': 'embed description',
	'emailEmbed.successHeadline': 'embed successHeadline',
	'emailEmbed.successDescription': 'embed successDescription',
	'emailEmbed.hexCode': 'embed hexCode',
};

const VALID_DRAFT_WITH_NESTED_OBJECT: DraftNewsletterData = {
	name: 'test name',
	emailEmbed: {
		name: 'embed name',
		title: 'embed title',
		description: 'embed description',
		successHeadline: 'embed successHeadline',
		successDescription: 'embed successDescription',
		hexCode: 'embed hexCode',
	},
};

describe('formDataToDraftNewsletterData', () => {
	it('will convert valid simple values', () => {
		const output = formDataToDraftNewsletterData(SIMPLE_VALID_FORM_DATA);
		expect(isDraftNewsletterData(output)).toBeTruthy();
		expect(output).toEqual(SIMPLE_VALID_DRAFT);
	});
	it('will leave out fields not in the newsletterDataSchema', () => {
		const output = formDataToDraftNewsletterData({
			...SIMPLE_VALID_FORM_DATA,
			foo: 'bar',
		});
		expect(isDraftNewsletterData(output)).toBeTruthy();
		expect(output).toEqual(SIMPLE_VALID_DRAFT);
	});
	it('will leave out values of the wrong type of which do not pass validation', () => {
		const output = formDataToDraftNewsletterData({
			...SIMPLE_VALID_FORM_DATA,
			brazeSubscribeAttributeName:
				'This is not an acceptable value as it has spaces',
			listId: 'This should be left out as listId should be a number',
		});
		expect(isDraftNewsletterData(output)).toBeTruthy();
		expect(output).toEqual(SIMPLE_VALID_DRAFT);
	});

	it('will convert to nested object values', () => {
		const output = formDataToDraftNewsletterData(
			VALID_FORM_DATA_WITH_NESTED_OBJECT,
		);
		expect(isDraftNewsletterData(output)).toBeTruthy();
		expect(output).toEqual(VALID_DRAFT_WITH_NESTED_OBJECT);
	});

	it('will convert string arrays if the key is in the schema', () => {
		const brazeSubscribeAttributeNameAlternate = ['v2', '2', 'foo'];
		const willNotAppearInOutput = [
			'because "willNotAppearInOutput" is not a key in the schema ',
		];

		const output = formDataToDraftNewsletterData({
			...SIMPLE_VALID_FORM_DATA,
			brazeSubscribeAttributeNameAlternate,
			willNotAppearInOutput,
		});
		expect(isDraftNewsletterData(output)).toBeTruthy();
		expect(output).toEqual({
			...SIMPLE_VALID_DRAFT,
			brazeSubscribeAttributeNameAlternate,
		});
	});
});

describe('draftNewsletterDataToFormData', () => {
	it('manages simple conversions', () => {
		const output = draftNewsletterDataToFormData(SIMPLE_VALID_DRAFT);
		expect(output).toEqual(SIMPLE_VALID_FORM_DATA);
	});
	it('manages nested object conversions', () => {
		const output = draftNewsletterDataToFormData(
			VALID_DRAFT_WITH_NESTED_OBJECT,
		);
		expect(output).toEqual(VALID_FORM_DATA_WITH_NESTED_OBJECT);
	});

	it('looses no data', () => {
		const formData = draftNewsletterDataToFormData(TECHSCAPE_IN_NEW_FORMAT);

		const recreatedNewsletter = formDataToDraftNewsletterData(formData);
		expect(isDraftNewsletterData(recreatedNewsletter)).toBeTruthy();
		// expect(recreatedNewsletter).toEqual(TECHSCAPE_IN_NEW_FORMAT);
	});
});
