import type { NewsletterData } from './schemas/newsletter-data-type';

const merchandisingMap = {
	AU: {
		header: 'Logic_Header_AU',
		footer: 'Logic_Footer_AU',
		middle: 'Logic_Middle_AU',
		lifecycle: 'Logic_Lifecycle_AU',
	},
	US: {
		header: 'Logic_Header_US',
		footer: 'Logic_Footer_US',
		middle: 'Logic_Middle_US',
		lifecycle: 'Logic_Lifecycle_US',
	},
	Culture: {
		header: 'Logic_Header_Culture',
		footer: 'Logic_Footer_Culture',
		middle: 'Logic_Middle_Culture',
		lifecycle: 'Logic_Lifecycle_Culture',
	},
	Sport: {
		header: 'Logic_Header_Sport',
		footer: 'Logic_Footer_Sport',
		middle: 'Logic_Middle_Sport',
		lifecycle: 'Logic_Lifecycle_Sport',
	},
}
const getMerchandisingContent = (newsletterData: NewsletterData, override?: string) => {
	const {regionFocus, theme} = newsletterData;

	if (override) {
		return merchandisingMap[override as keyof typeof merchandisingMap]
	}

	if (regionFocus && ['US', 'AU'].includes(regionFocus)) {
		return merchandisingMap[regionFocus as keyof typeof merchandisingMap]
	}
	if (['culture', 'sport'].includes(theme)) {
		return merchandisingMap[theme as keyof typeof merchandisingMap]
	}
	return {
		header: 'SET APPROPRIATE MERCHANDISING CONTENT',
		footer: 'SET APPROPRIATE MERCHANDISING CONTENT',
		middle: 'SET APPROPRIATE MERCHANDISING CONTENT',
		lifecycle: 'SET APPROPRIATE MERCHANDISING CONTENT',
	}
}

export const generateBrazeTemplateString = (newsletterData: NewsletterData, override?: string): string => {
    const {identityName, campaignName, campaignCode, seriesTag, category} = newsletterData;
    const contentBlocks = category === 'article-based' ? 'Editorial_FirstEditionContent' : 'Editorial_Content'
    const emailEndpoint = seriesTag && ['article-based', 'article-based-legacy'].includes(category) ? `${seriesTag}/latest.json` : 'EMAIL ENDPOINT IS NOT SET';
		const { header, footer, middle, lifecycle} = getMerchandisingContent(newsletterData, override);
    return `{% comment %} Required Campaign-level variables {% endcomment %}
{% assign identity_newsletter_id = "${identityName}" %}
{% assign email_endpoint = "${emailEndpoint}" %}
{% assign utm_campaign = "${campaignName ?? "CAMPAIGN NAME IS NOT SET"}" %}
{% assign CMP = "${campaignCode ?? 'CAMPAIGN CODE IS NOT SET'}" %}
{% capture email_content %}{{content_blocks.\${${contentBlocks}}}}{% endcapture %}
{% capture merchandising_content_header %}{{content_blocks.\${${header}}}}{% endcapture %}
{% capture merchandising_content_lifecycle %}{{content_blocks.\${${lifecycle}}}}{% endcapture %}
{% capture merchandising_content_middle %}{{content_blocks.\${${middle}}}}{% endcapture %}
{% capture merchandising_content_footer %}{{content_blocks.\${${footer}}}}{% endcapture %}
{% capture merchandising_content_newsletter %}{% endcapture %}
{{ email_content | strip | replace: "<!-- Braze Placeholder - Above Banner -->", merchandising_content_header | replace: "<!-- Braze Placeholder - Above Section 1 -->", merchandising_content_lifecycle | replace: "<!-- Braze Placeholder - Above Section 3 -->", merchandising_content_middle | replace: "<!-- Braze Placeholder - Above Footer -->", merchandising_content_footer | replace: "<!-- Braze Placeholder - Above Section 5 -->", merchandising_content_newsletter }}`;
}
