import type { NewsletterData } from './schemas/newsletter-data-type';

export const generateBrazeTemplateString = (
	newsletterData: NewsletterData,
): string => {
	const { identityName, campaignName, campaignCode, seriesTag, category } =
		newsletterData;
	const emailEndpoint =
		seriesTag && ['article-based', 'article-based-legacy'].includes(category)
			? `${seriesTag}/latest.json`
			: 'EMAIL ENDPOINT IS NOT SET';
	return `{% comment %} Required Campaign-level variables {% endcomment %}
{% assign identity_newsletter_id = "${identityName}" %}
{% assign email_endpoint = "${emailEndpoint}" %}
{% assign utm_campaign = "${campaignName ?? 'CAMPAIGN NAME IS NOT SET'}" %}
{% assign CMP = "${campaignCode ?? 'CAMPAIGN CODE IS NOT SET'}" %}
{% capture email_content %}{% endcapture %}
{% capture merchandising_content_header %}{% endcapture %}
{% capture merchandising_content_middle %}{% endcapture %}
{% capture merchandising_content_footer %}{% endcapture %}
{% capture merchandising_content_newsletter %}{% endcapture %}
{{ email_content | strip | replace: "<!-- Braze Placeholder - Above Banner -->", merchandising_content_header | replace: "<!-- Braze Placeholder - Above Section 1 -->", merchandising_content_lifecycle | replace: "<!-- Braze Placeholder - Above Section 3 -->", merchandising_content_middle | replace: "<!-- Braze Placeholder - Above Footer -->", merchandising_content_footer | replace: "<!-- Braze Placeholder - Above Section 5 -->", merchandising_content_newsletter }}`;
};
