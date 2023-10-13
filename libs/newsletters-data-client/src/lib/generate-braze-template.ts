import {NewsletterData} from "@newsletters-nx/newsletters-data-client";

export const generateGrazeTemplateString = (newsletterData: NewsletterData): string => {
    const {identityName, campaignName, campaignCode, seriesTag, category} = newsletterData;
    const contentBlocks = category === 'article-based' ? 'Editorial_FirstEditionContent' : 'Editorial_Content'
    const emailEndpoint = seriesTag && ['article-based', 'article-based-legacy'].includes(category) ? `${seriesTag}/latest.json` : 'EMAIL ENDPOINT IS NOT SET';
    return `{% comment %} Required Campaign-level variables {% endcomment %}
{% assign identity_newsletter_id = "${identityName}" %}
{% assign email_endpoint = "${emailEndpoint}" %}
{% assign utm_campaign = "${campaignName ?? "CAMPAIGN NAME IS NOT SET"}" %}
{% assign CMP = "${campaignCode ?? 'CAMPAIGN CODE IS NOT SET'}" %}
{% capture email_content %}{{content_blocks.\${${contentBlocks}}}{% endcapture %}
{% capture merchandising_content_header %}{{content_blocks.\${Logic_Header_Culture}}}{% endcapture %}
{% capture merchandising_content_lifecycle %}{{content_blocks.\${Logic_Lifecycle_Culture}}}{% endcapture %}
{% capture merchandising_content_middle %}{{content_blocks.\${Logic_Middle_Culture}}}{% endcapture %}
{% capture merchandising_content_footer %}{{content_blocks.\${Logic_Footer_Culture}}}{% endcapture %}
{% capture merchandising_content_newsletter %}{% endcapture %}
{% capture merchandising_content_advert %}{{content_blocks.\${ADVERT_RECIPECARD_October23_Belazu_WordOfMouth}}}{% endcapture %}
{{ email_content | strip | replace: "<!-- Braze Placeholder - Above Banner -->", merchandising_content_header | replace: "<!-- Braze Placeholder - Above Section 1 -->", merchandising_content_lifecycle | replace: "<!-- Braze Placeholder - Above Section 3 -->", merchandising_content_middle | replace: "<!-- Braze Placeholder - Above Footer -->", merchandising_content_footer | replace: "<!-- Braze Placeholder - Above Section 5 -->", merchandising_content_newsletter | replace: "<!-- Braze Placeholder - Above Section 4 -->", merchandising_content_advert }}`;
}
