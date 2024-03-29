export const regExPatterns = {
	name: /{{name}}/g,
	listId: /{{listId}}/g,
	identityName: /{{identityName}}/g,
	brazeSubscribeEventNamePrefix: /{{brazeSubscribeEventNamePrefix}}/g,
	brazeNewsletterName: /{{brazeNewsletterName}}/g,
	brazeSubscribeAttributeName: /{{brazeSubscribeAttributeName}}/g,
	brazeSubscribeAttributeNameAlternate:
		/{{brazeSubscribeAttributeNameAlternate}}/g,
	campaignName: /{{campaignName}}/g,
	campaignCode: /{{campaignCode}}/g,
	seriesTag: /{{seriesTag}}/g,
	composerTag: /{{composerTag}}/g,
	composerCampaignTag: /{{composerCampaignTag}}/g,
	answer: /{{answer}}/g,
} as const;
