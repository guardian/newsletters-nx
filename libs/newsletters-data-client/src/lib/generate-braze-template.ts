import type { NewsletterData } from './schemas/newsletter-data-type';

export type DrrSlotKey = 'AUS' | 'Culture' | 'Sport' | 'US' |'Features' | 'Global';

const getDrrSlotSet = (slotKey: DrrSlotKey) => {
	return {
		header: `Logic_Header_${slotKey}`,
		footer: `Logic_Footer${slotKey}`,
		middle: `Logic_Middle_${slotKey}`,
		lifecycle: `Logic_Lifecycle_${slotKey}`
	}
}
const getMerchandisingContent = (newsletterData: NewsletterData, override?: string) => {
	const {regionFocus, theme} = newsletterData;

	if (override) {
		return getDrrSlotSet(override as DrrSlotKey)
	}

	if (regionFocus && ['US', 'AUS'].includes(regionFocus)) {
		return getDrrSlotSet(regionFocus as DrrSlotKey);
	}
	if (['culture', 'sport'].includes(theme)) {
		return getDrrSlotSet(theme as DrrSlotKey);
	}
	return undefined;
}

export const generateBrazeTemplateString = (newsletterData: NewsletterData, override?: string): string => {
    const {identityName, campaignName, campaignCode, seriesTag, category} = newsletterData;
    const contentBlocks = category === 'article-based' ? 'Editorial_FirstEditionContent' : 'Editorial_Content'
    const emailEndpoint = seriesTag && ['article-based', 'article-based-legacy'].includes(category) ? `${seriesTag}/latest.json` : 'EMAIL ENDPOINT IS NOT SET';
		const merchandisingContent = getMerchandisingContent(newsletterData, override);
		if (!merchandisingContent) return "Could not determine merchandising content. Please select a DRR slot set";
		const { header, footer, middle, lifecycle} = merchandisingContent;
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
