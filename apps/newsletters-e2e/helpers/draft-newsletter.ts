import type { APIRequestContext } from '@playwright/test';
import type { WizardId } from '@newsletters-nx/newsletter-workflow';

const API_BASE = process.env['API_URL'] ?? 'http://localhost:3000';

type SupportedValue =
	| string
	| number
	| boolean
	| null
	| undefined
	| string[]
	| Record<string, string | number | boolean>;

type FormData = Record<string, SupportedValue>;

interface ProductionDetailsFields {
	category:
		| 'article-based'
		| 'fronts-based'
		| 'manual-send'
		| 'article-based-legacy'
		| 'other';
	frequency: string;
	onlineArticle?:
		| 'Email only'
		| 'Web for first send only'
		| 'Web for all sends';
}

interface DatesFields {
	privateUntilLaunch: boolean;
	launchDate?: string | null;
	signUpPageDate?: string | null;
	thrasherDate?: string | null;
}

interface TargetingFields {
	theme: 'news' | 'opinion' | 'culture' | 'sport' | 'lifestyle' | 'features';
	group: string;
	regionFocus?: 'UK' | 'AU' | 'US' | 'INT' | 'EUR' | null;
}

interface TagsFields {
	seriesTag?: string;
	seriesTagDescription?: string;
	composerTag?: string;
	composerCampaignTag?: string;
}

type ThrasherFields = Record<string, string | undefined>;

interface SignUpPageFields {
	signUpDescription: string;
	signUpEmbedDescription: string;
	signUpHeadline?: string;
	mailSuccessDescription?: string;
}

type StepFormDataMap = {
	productionDetails: ProductionDetailsFields;
	dates: DatesFields;
	targeting: TargetingFields;
	tags: TagsFields;
	thrasher: ThrasherFields;
	signUpPage: SignUpPageFields;
};

type UpdateStepId = keyof StepFormDataMap;

interface StepResponse {
	currentStepId?: string;
	formData?: FormData;
	errorMessage?: string;
	hasPersistentError?: boolean;
}

async function postStep(
	request: APIRequestContext,
	body: {
		wizardId: WizardId;
		stepId: string;
		buttonId?: string;
		buttonType?: string;
		formData?: FormData;
	},
): Promise<StepResponse> {
	const response = await request.post(`${API_BASE}/api/currentstep`, {
		data: body,
	});
	const json = (await response.json()) as StepResponse;
	if (!response.ok()) {
		throw new Error(
			`Step "${body.stepId}" failed (${response.status()}): ${JSON.stringify(json)}`,
		);
	}
	if (json.errorMessage) {
		throw new Error(
			`Step "${body.stepId}" returned error: ${json.errorMessage}`,
		);
	}
	return json;
}

export async function createDraftNewsletter(
	request: APIRequestContext,
	name: string,
): Promise<number> {
	await postStep(request, {
		wizardId: 'NEWSLETTER_DATA',
		stepId: 'intro',
		buttonId: 'next',
		buttonType: 'NEXT',
	});

	const createResponse = await postStep(request, {
		wizardId: 'NEWSLETTER_DATA',
		stepId: 'createDraftNewsletter',
		buttonId: 'next',
		buttonType: 'NEXT',
		formData: { name },
	});

	const listId = createResponse.formData?.['listId'] as number | undefined;
	if (!listId) {
		throw new Error(
			`No listId returned after createDraftNewsletter. Response: ${JSON.stringify(createResponse)}`,
		);
	}

	return listId;
}

/**
 * Updates fields on an existing draft newsletter by posting to a specific wizard step.
 * The listId must be included so the API routes to executeModify rather than executeCreate.
 *
 * Available stepIds:
 *   'productionDetails'
 *   'dates'
 *   'targeting'
 *   'tags'
 *   'thrasher'
 *   'signUpPage'
 */
export async function updateDraftNewsletter<S extends UpdateStepId>(
	request: APIRequestContext,
	listId: number,
	stepId: S,
	fields: StepFormDataMap[S],
): Promise<void> {
	await postStep(request, {
		wizardId: 'NEWSLETTER_DATA',
		stepId,
		buttonId: 'next',
		buttonType: 'NEXT',
		formData: { listId, ...fields },
	});
}

/**
 * Deletes a draft newsletter by its listId.
 * Requires the writeToDrafts permission (USE_DEVELOPER_PROFILE=true in dev/test).
 */
export async function deleteDraftNewsletter(
	request: APIRequestContext,
	listId: number,
): Promise<void> {
	const response = await request.delete(`${API_BASE}/api/drafts/${listId}`);
	if (!response.ok()) {
		const body = await response.text();
		throw new Error(
			`Failed to delete draft ${listId} (${response.status()}): ${body}`,
		);
	}
}

/**
 * Deletes all draft newsletters by name match
 * call at the start of beforeEach hooks to clean up stale entries
 * left over from interupted test runs
 */
export async function cleanupStaleTestDrafts(
	request: APIRequestContext,
	namePrefix: string,
): Promise<void> {
	const response = await request.get(`${API_BASE}/api/drafts`);
	if (!response.ok()) {
		return;
	}
	const body = (await response.json()) as {
		ok: boolean;
		data: Array<{ listId: number; name?: string }>;
	};

	const stale = body.data.filter((newsletter) =>
		newsletter.name?.startsWith(namePrefix),
	);

	await Promise.all(
		stale.map(async (d) => {
			const res = await request.delete(`${API_BASE}/api/drafts/${d.listId}`);
			if (!res.ok() && res.status() !== 404) {
				// ignore 404 errors, another parrelel test may have already deleted the newsletter
				console.warn(
					`Failed to delete stale draft ${d.listId}: ${res.status()}`,
				);
			}
		}),
	);
}
