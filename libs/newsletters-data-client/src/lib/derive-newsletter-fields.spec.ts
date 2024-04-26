import { deriveNewsletterFieldsFromName } from './derive-newsletter-fields';

describe('deriveNewsletterFieldsFromName', () => {
	it('should derive the newsletter fields', () => {
		const expectedOutput = {
			identityName: "foo-bar",
			brazeSubscribeEventNamePrefix: "foo_bar",
			brazeNewsletterName: "Editorial_foobar",
			brazeSubscribeAttributeName: "foobar_Subscribe_Email",
			brazeSubscribeAttributeNameAlternate: ["email_subscribe_foo_bar"],
			campaignName: "foobar",
			campaignCode: "foobar_email",
		};
		expect(deriveNewsletterFieldsFromName("foo bar")).toEqual(expectedOutput);
		expect(deriveNewsletterFieldsFromName("foo - bar")).toEqual(expectedOutput);
		expect(deriveNewsletterFieldsFromName("foo - ::: ----- bar ---------")).toEqual(expectedOutput);
	});
});
