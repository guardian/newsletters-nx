import type { StepListing, WizardLayout } from '@newsletters-nx/state-machine';
import { listStepsIn } from '@newsletters-nx/state-machine';
import { cancelLayout as cancelLaunchNewsletterLayout } from './steps/launchNewsletter/cancelLayout';
import { finishLayout as finishLaunchNewsletterLayout } from './steps/launchNewsletter/finishLayout';
import { launchNewsletterLayout } from './steps/launchNewsletter/launchNewsletterLayout';
import { brazeLayout } from './steps/newsletterData/brazeLayout';
import { cancelLayout as cancelNewsletterDataLayout } from './steps/newsletterData/cancelLayout';
import { completeDataCollectionLayout } from './steps/newsletterData/completeDataCollectionLayout';
import { createDraftNewsletterLayout } from './steps/newsletterData/createDraftNewsletterLayout';
import { dateLayout } from './steps/newsletterData/dateLayout';
import { designBriefLayout } from './steps/newsletterData/designBriefLayout';
import { editBrazeLayout } from './steps/newsletterData/editBrazeLayout';
import { editDraftNewsletterLayout } from './steps/newsletterData/editDraftNewsletterLayout';
import { editIdentityNameLayout } from './steps/newsletterData/editIdentityNameLayout';
import { editOphanLayout } from './steps/newsletterData/editOphanLayout';
import { emailCentralProductionLayout } from './steps/newsletterData/emailCentralProductionLayout';
import { finishLayout as finishNewsletterDataLayout } from './steps/newsletterData/finishLayout';
import { footerLayout } from './steps/newsletterData/footerLayout';
import { frequencyLayout } from './steps/newsletterData/frequencyLayout';
import { identityNameLayout } from './steps/newsletterData/identityNameLayout';
import { imageLayout } from './steps/newsletterData/imageLayout';
import { linkListLayout } from './steps/newsletterData/linkListLayout';
import { newsletterHeaderLayout } from './steps/newsletterData/newsletterHeaderLayout';
import { onlineArticleLayout } from './steps/newsletterData/onlineArticleLayout';
import { ophanLayout } from './steps/newsletterData/ophanLayout';
import { pillarLayout } from './steps/newsletterData/pillarLayout';
import { podcastLayout } from './steps/newsletterData/podcastLayout';
import { readMoreLayout } from './steps/newsletterData/readMoreLayout';
import { regionFocusLayout } from './steps/newsletterData/regionFocusLayout';
import { signUpLayout } from './steps/newsletterData/signUpLayout';
import { tagsLayout } from './steps/newsletterData/tagsLayout';
import { thrasherLayout } from './steps/newsletterData/thrasherLayout';
import { renderingOptionsLayout } from './steps/renderingOptions';

export const newslettersWorkflowStepLayout: Record<string, WizardLayout> = {
	NEWSLETTER_DATA: {
		createDraftNewsletter: createDraftNewsletterLayout,
		editDraftNewsletter: editDraftNewsletterLayout,
		cancel: cancelNewsletterDataLayout,
		dates: dateLayout,
		pillar: pillarLayout,
		regionFocus: regionFocusLayout,
		frequency: frequencyLayout,
		onlineArticle: onlineArticleLayout,
		tags: tagsLayout,
		thrasher: thrasherLayout,
		designBrief: designBriefLayout,
		signUp: signUpLayout,
		newsletterHeader: newsletterHeaderLayout,
		image: imageLayout,
		readMore: readMoreLayout,
		linkList: linkListLayout,
		podcast: podcastLayout,
		footer: footerLayout,
		identityName: identityNameLayout,
		editIdentityName: editIdentityNameLayout,
		braze: brazeLayout,
		editBraze: editBrazeLayout,
		ophan: ophanLayout,
		editOphan: editOphanLayout,
		completeDataCollection: completeDataCollectionLayout,
		emailCentralProduction: emailCentralProductionLayout,
		finish: finishNewsletterDataLayout,
	},
	LAUNCH_NEWSLETTER: {
		launchNewsletter: launchNewsletterLayout,
		cancel: cancelLaunchNewsletterLayout,
		finish: finishLaunchNewsletterLayout,
	},
	RENDERING_OPTIONS: renderingOptionsLayout,
};

export const getFormSchema = (
	wizardId: keyof typeof newslettersWorkflowStepLayout,
	stepId: string,
) => {
	const wizard = newslettersWorkflowStepLayout[wizardId];
	if (!wizard) {
		return undefined;
	}
	const step = wizard[stepId];
	return step?.schema;
};

export const getStepList = (
	wizardId: keyof typeof newslettersWorkflowStepLayout,
): StepListing[] => {
	const wizard = newslettersWorkflowStepLayout[wizardId];
	if (!wizard) {
		return [];
	}

	return listStepsIn(wizard);
};
