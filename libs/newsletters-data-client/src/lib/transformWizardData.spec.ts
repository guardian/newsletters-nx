import { TECHSCAPE_IN_NEW_FORMAT } from '../fixtures/newsletter-fixtures';
import type { DraftNewsletterData } from './draft-newsletter-data-type';
import { isDraftNewsletterData } from './draft-newsletter-data-type';
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
	'renderingOptions.linkListSubheading': ['frog', 'bird', 'snake'],
	'renderingOptions.displayStandfirst': true,
};

const VALID_DRAFT_WITH_NESTED_OBJECT: DraftNewsletterData = {
	name: 'test name',
	renderingOptions: {
		linkListSubheading: ['frog', 'bird', 'snake'],
		displayStandfirst: true,
	},
};

const FORM_DATA_WITH_DATES: FormDataRecord = {
	name: 'test name',
	launchDate: new Date('01-02-2023'),
	signUpPageDate: new Date('10-10-2020').toDateString(),
	thrasherDate: new Date('10-10-2021'),
};
const DRAFT_WITH_DATES: DraftNewsletterData = {
	name: 'test name',
	launchDate: new Date('01-02-2023'),
	signUpPageDate: new Date('10-10-2020'),
	thrasherDate: new Date('10-10-2021'),
};

const FORM_DATA_WITH_UNDEFINED: FormDataRecord = {
	name: 'test name',
	designBriefDoc: undefined,
};
const DRAFT_WITH_UNDEFINED: DraftNewsletterData = {
	name: 'test name',
	designBriefDoc: undefined,
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

	it('will convert string arrays if the key is in the schema and the strings pass validation', () => {
		const brazeSubscribeAttributeNameAlternate = [
			'valid_value_one',
			'valid_value_two',
			'valid_value_three',
		];
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

	it('will not convert string arrays if the key is in the schema but any of the string values fail validation', () => {
		const brazeSubscribeAttributeNameAlternate = [
			'valid_value_one',
			'valid_value_two',
			'not valid: brazeSubscribeAttributeNameAlternate items must be underscore_case',
		];

		const output = formDataToDraftNewsletterData({
			...SIMPLE_VALID_FORM_DATA,
			brazeSubscribeAttributeNameAlternate,
		});
		expect(isDraftNewsletterData(output)).toBeTruthy();
		expect(output).toEqual({
			...SIMPLE_VALID_DRAFT,
		});
	});

	it('manages Date conversions, for dates stored as strings or Date objects', () => {
		const output = formDataToDraftNewsletterData(FORM_DATA_WITH_DATES);
		expect(output).toEqual(DRAFT_WITH_DATES);
	});

	it('preserves undefined values', () => {
		const output = formDataToDraftNewsletterData(FORM_DATA_WITH_UNDEFINED);
		expect(output).toEqual(DRAFT_WITH_UNDEFINED);

		expect(Object.entries(output)).toEqual(
			Object.entries(DRAFT_WITH_UNDEFINED),
		);
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

	it('converts Dates from the draft to Dates on the form', () => {
		const outputFormData = draftNewsletterDataToFormData(DRAFT_WITH_DATES);
		expect(outputFormData['signUpPageDate']).toEqual(
			new Date(FORM_DATA_WITH_DATES['signUpPageDate'] as Date | string),
		);
		expect(outputFormData['thrasherDate']).toEqual(
			new Date(FORM_DATA_WITH_DATES['thrasherDate'] as Date | string),
		);
	});

	it('looses no data', () => {
		const formData = draftNewsletterDataToFormData(TECHSCAPE_IN_NEW_FORMAT);
		const recreatedNewsletter = formDataToDraftNewsletterData(formData);
		expect(isDraftNewsletterData(recreatedNewsletter)).toBeTruthy();
		expect(recreatedNewsletter).toEqual(TECHSCAPE_IN_NEW_FORMAT);
	});
});
