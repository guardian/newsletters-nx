import type { NewsletterData } from './schemas/newsletter-data-type';

const getMerchandisingContent = ({ regionFocus, theme }:  NewsletterData) => {
	if (regionFocus === 'AU') {
		return {
			header: 'Logic_Header_AUS',
			footer: 'Logic_Footer_AUS',
			middle: 'Logic_Middle_AUS',
			lifecycle: 'Logic_Lifecycle_AUS',
		}
	}
	if (regionFocus === 'US') {
		return {
			header: 'Logic_Header_US',
			footer: 'Logic_Footer_US',
			middle: 'Logic_Middle_US',
			lifecycle: 'Logic_Lifecycle_US',
		}
	}
	if (theme === 'culture') {
		return {
			header: 'Logic_Header_Culture',
			footer: 'Logic_Footer_Culture',
			middle: 'Logic_Middle_Culture',
			lifecycle: 'Logic_Lifecycle_Culture',
		}
	}
	if (theme === 'sport') {
		return {
			header: 'Logic_Header_Sport',
			footer: 'Logic_Footer_Sport',
			middle: 'Logic_Middle_Sport',
			lifecycle: 'Logic_Lifecycle_Sport',
		}
	}
	return {
		header: 'SET APPROPRIATE MERCHANDISING CONTENT',
		footer: 'SET APPROPRIATE MERCHANDISING CONTENT',
		middle: 'SET APPROPRIATE MERCHANDISING CONTENT',
		lifecycle: 'SET APPROPRIATE MERCHANDISING CONTENT',
	}
}

export const generateBrazeTemplateString = (newsletterData: NewsletterData): string => {
    const {identityName, campaignName, campaignCode, seriesTag, category} = newsletterData;
    const contentBlocks = category === 'article-based' ? 'Editorial_FirstEditionContent' : 'Editorial_Content'
    const emailEndpoint = seriesTag && ['article-based', 'article-based-legacy'].includes(category) ? `${seriesTag}/latest.json` : 'EMAIL ENDPOINT IS NOT SET';
		const { header, footer, middle, lifecycle} = getMerchandisingContent(newsletterData);
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
{{ email_content | strip | replace: "<!-- Braze Placeholder - Above Banner -->", merchandising_content_header | replace: "<!-- Braze Placeholder - Above Section 1 -->", merchandising_content_lifecycle | replace: "<!-- Braze Placeholder - Above Section 3 -->", merchandising_content_middle | replace: "<!-- Braze Placeholder - Above Footer -->", merchandising_content_footer | replace: "<!-- Braze Placeholder - Above Section 5 -->", merchandising_content_newsletter | replace: "<!-- Braze Placeholder - Above Section 4 -->", merchandising_content_advert }}`;
}
