import type { NewsletterData } from './newsletter-data-type';
import { ispartialNewsletterData } from './newsletter-data-type';
import type { FormDataRecord } from './transformWizardData';
import {
	formDataToPartialNewsletter,
	partialNewsletterToFormData,
} from './transformWizardData';

const SIMPLE_VALID_FORM_DATA: FormDataRecord = {
	name: 'test name',
	identityName: 'test-name',
	status: 'paused',
	emailConfirmation: false,
};

const SIMPLE_VALID_DRAFT: Partial<NewsletterData> = {
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

const VALID_DRAFT_WITH_NESTED_OBJECT: Partial<NewsletterData> = {
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

describe('formDataToPartialNewsletter', () => {
	it('will convert valid simple values', () => {
		const output = formDataToPartialNewsletter(SIMPLE_VALID_FORM_DATA);
		expect(ispartialNewsletterData(output)).toBeTruthy();
		expect(output).toEqual(SIMPLE_VALID_DRAFT);
	});
	it('will leave out fields not in the newsletterDataSchema', () => {
		const output = formDataToPartialNewsletter({
			...SIMPLE_VALID_FORM_DATA,
			foo: 'bar',
		});
		expect(ispartialNewsletterData(output)).toBeTruthy();
		expect(output).toEqual(SIMPLE_VALID_DRAFT);
	});
	it('will leave out values of the wrong type of which do not pass validation', () => {
		const output = formDataToPartialNewsletter({
			...SIMPLE_VALID_FORM_DATA,
			brazeSubscribeAttributeName:
				'This is not an acceptable value as it has spaces',
			listId: 'This should be left out as listId should be a number',
		});
		expect(ispartialNewsletterData(output)).toBeTruthy();
		expect(output).toEqual(SIMPLE_VALID_DRAFT);
	});

	it('will convert to nested object values', () => {
		const output = formDataToPartialNewsletter(
			VALID_FORM_DATA_WITH_NESTED_OBJECT,
		);
		expect(ispartialNewsletterData(output)).toBeTruthy();
		expect(output).toEqual(VALID_DRAFT_WITH_NESTED_OBJECT);
	});
});

describe('partialNewsletterToFormData', () => {
	it('manages simple conversions', () => {
		const output = partialNewsletterToFormData(SIMPLE_VALID_DRAFT);
		expect(output).toEqual(SIMPLE_VALID_FORM_DATA);
	});
	it('manages nested object conversions', () => {
		const output = partialNewsletterToFormData(VALID_DRAFT_WITH_NESTED_OBJECT);
		expect(output).toEqual(VALID_FORM_DATA_WITH_NESTED_OBJECT);
	});
});
