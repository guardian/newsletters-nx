import { Newsletter } from '..';

export const VALID_TECHSCAPE: Newsletter = {
  identityName: 'tech-scape',
  name: 'TechScape',
  cancelled: false,
  restricted: false,
  paused: false,
  emailConfirmation: false,
  brazeNewsletterName: 'Editorial_TechScape',
  brazeSubscribeAttributeName: 'TechScape_Subscribe_Email',
  brazeSubscribeEventNamePrefix: 'tech_scape',
  theme: 'news',
  group: 'News in depth',
  description:
    "Alex Hern's weekly dive in to how technology is shaping our lives",
  frequency: 'Weekly',
  listIdV1: -1,
  listId: 6013,
  signupPage:
    '/info/2022/sep/20/sign-up-for-the-techscape-newsletter-our-free-technology-email',
  emailEmbed: {
    name: 'TechScape',
    title: 'Sign up for TechScape',
    description:
      "Alex Hern's weekly dive in to how technology is shaping our lives",
    successHeadline: 'Subscription confirmed',
    successDescription: "We'll send you TechScape every week",
    hexCode: '#DCDCDC',
  },
  campaignName: 'TechScape',
  campaignCode: 'techscape_email',
  brazeSubscribeAttributeNameAlternate: [
    'email_subscribe_tech_scape',
    'TechTonic_Subscribe_Email',
    'email_subscribe_tech_tonic',
  ],
};
