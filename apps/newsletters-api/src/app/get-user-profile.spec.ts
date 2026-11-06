import { generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { AlbJwtVerifier } from 'aws-jwt-verify';
import { SimpleFetcher } from 'aws-jwt-verify/https';
import { getUserProfile } from './get-user-profile';

const originalEnv = process.env;
const albArn =
	'arn:aws:elasticloadbalancing:eu-west-1:123456789012:loadbalancer/app/newsletters-tool/1234567890abcdef';
const clientId = 'newsletters-test-client';
const profile = {
	sub: 'google-user-id',
	name: 'Test Editor',
	email: 'editor@guardian.co.uk',
	email_verified: true,
};
const { privateKey, publicKey } = generateKeyPairSync('ec', {
	namedCurve: 'prime256v1',
});
const otherKeyPair = generateKeyPairSync('ec', {
	namedCurve: 'prime256v1',
});
const publicKeyPem = new TextEncoder().encode(
	publicKey.export({ type: 'spki', format: 'pem' }).toString(),
).buffer;
let kid: string;
let fetchMock: jest.SpiedFunction<SimpleFetcher['fetch']>;

const makeHeader = (overrides: Record<string, unknown> = {}) => ({
	alg: 'ES256',
	kid,
	signer: albArn,
	iss: 'https://accounts.google.com',
	client: clientId,
	exp: Math.floor(Date.now() / 1000) + 3600,
	...overrides,
});

const encode = (value: string | Buffer, padded: boolean) => {
	const encoded = Buffer.from(value).toString('base64url');
	return padded
		? encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')
		: encoded;
};

const makeJwt = (
	payloadJson = JSON.stringify(profile),
	header: unknown = makeHeader(),
	key = privateKey,
	padded = true,
) => {
	const signingInput = `${encode(JSON.stringify(header), padded)}.${encode(payloadJson, padded)}`;
	const signature = sign('sha256', Buffer.from(signingInput), {
		key,
		dsaEncoding: 'ieee-p1363',
	});
	return `${signingInput}.${encode(signature, padded)}`;
};

const requestWithToken = (token?: string | string[]) => ({
	headers: token === undefined ? {} : { 'x-amzn-oidc-data': token },
});

const verificationFailure = {
	errorMessage: 'Failed to verify user profile.',
	profile: undefined,
};

beforeEach(() => {
	process.env = {
		...originalEnv,
		ALB_ARN: albArn,
		GOOGLE_CLIENT_ID: clientId,
		ENABLE_JWT_VERIFICATION: 'true',
		USE_DEVELOPER_PROFILE: 'false',
		USE_FAKE_JWT: 'false',
	};
	kid = randomUUID();
	fetchMock = jest
		.spyOn(SimpleFetcher.prototype, 'fetch')
		.mockResolvedValue(publicKeyPem);
	jest.spyOn(console, 'warn').mockImplementation(() => undefined);
	jest.spyOn(console, 'info').mockImplementation(() => undefined);
});

afterEach(() => {
	process.env = originalEnv;
	jest.restoreAllMocks();
});

describe('getUserProfile', () => {
	it.each([undefined, ['one-token', 'another-token']])(
		'rejects a missing or repeated identity header: %j',
		async (token) => {
			expect(await getUserProfile(requestWithToken(token))).toEqual({
				errorMessage: 'No user profile.',
				profile: undefined,
			});
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);

	it.each([true, false])(
		'accepts a correctly signed ES256 JWT (base64 padding: %s)',
		async (padded) => {
			const token = makeJwt(
				JSON.stringify(profile),
				makeHeader(),
				privateKey,
				padded,
			);
			expect(await getUserProfile(requestWithToken(token))).toEqual({
				profile,
			});
			expect(fetchMock).toHaveBeenCalledWith(
				`https://public-keys.auth.elb.eu-west-1.amazonaws.com/${kid}`,
			);
		},
	);

	it('preserves Unicode in a verified profile', async () => {
		const unicodeProfile = { ...profile, name: 'Jos\u00e9 Editor' };
		const token = makeJwt(JSON.stringify(unicodeProfile));
		expect(await getUserProfile(requestWithToken(token))).toEqual({
			profile: unicodeProfile,
		});
	});

	it.each(['{', '', 'undefined', '{"sub":'])(
		'rejects signed payloads containing invalid JSON: %j',
		async (payloadJson) => {
			expect(
				await getUserProfile(requestWithToken(makeJwt(payloadJson))),
			).toEqual(verificationFailure);
		},
	);

	it.each([
		null,
		[],
		[profile],
		'editor',
		42,
		true,
		{},
		{ ...profile, sub: undefined },
		{ ...profile, sub: '' },
		{ ...profile, sub: 42 },
		{ ...profile, name: [] },
		{ ...profile, email: 42 },
		{ ...profile, email_verified: 'true' },
		{ ...profile, picture: {} },
		{ ...profile, exp: 'not-a-timestamp' },
	])(
		'rejects a signed payload with an invalid profile structure: %j',
		async (payload) => {
			expect(
				await getUserProfile(
					requestWithToken(makeJwt(JSON.stringify(payload))),
				),
			).toEqual(verificationFailure);
		},
	);

	it.each([null, [], 'header', 42])(
		'rejects a JWT whose header is not a JSON object: %j',
		async (header) => {
			expect(
				await getUserProfile(
					requestWithToken(makeJwt(JSON.stringify(profile), header)),
				),
			).toEqual(verificationFailure);
		},
	);

	it.each(['not-a-jwt', 'header.payload', 'header.payload.signature.extra'])(
		'rejects a malformed JWT: %s',
		async (token) => {
			expect(await getUserProfile(requestWithToken(token))).toEqual(
				verificationFailure,
			);
		},
	);

	it('rejects malformed JSON in the header', async () => {
		const token = makeJwt().split('.');
		token[0] = encode('{', true);
		expect(await getUserProfile(requestWithToken(token.join('.')))).toEqual(
			verificationFailure,
		);
	});

	it('rejects a JWT signed with a different private key', async () => {
		const token = makeJwt(
			JSON.stringify(profile),
			makeHeader(),
			otherKeyPair.privateKey,
		);
		expect(await getUserProfile(requestWithToken(token))).toEqual(
			verificationFailure,
		);
	});

	it('rejects a modified payload even if it is a valid profile', async () => {
		const token = makeJwt().split('.');
		token[1] = encode(
			JSON.stringify({ ...profile, email: 'another@guardian.co.uk' }),
			true,
		);
		expect(await getUserProfile(requestWithToken(token.join('.')))).toEqual(
			verificationFailure,
		);
	});

	it('rejects a modified signed header', async () => {
		const token = makeJwt().split('.');
		token[0] = encode(
			JSON.stringify(makeHeader({ exp: Math.floor(Date.now() / 1000) + 7200 })),
			true,
		);
		expect(await getUserProfile(requestWithToken(token.join('.')))).toEqual(
			verificationFailure,
		);
	});

	it('rejects an unsigned JWT', async () => {
		const token = makeJwt().split('.');
		token[2] = '';
		expect(await getUserProfile(requestWithToken(token.join('.')))).toEqual(
			verificationFailure,
		);
	});

	it.each([
		{ signer: albArn.replace('123456789012', '999999999999') },
		{ signer: undefined },
		{ client: 'another-client' },
		{ client: undefined },
		{ iss: 'https://another-issuer.example' },
		{ iss: undefined },
		{ exp: Math.floor(Date.now() / 1000) - 60 },
		{ exp: undefined },
		{ exp: 'not-a-timestamp' },
		{ exp: true },
		{ alg: 'none' },
		{ alg: 'HS256' },
		{ alg: 'RS256' },
	])(
		'rejects a signed JWT with invalid header claims: %j',
		async (overrides) => {
			const token = makeJwt(JSON.stringify(profile), makeHeader(overrides));
			expect(await getUserProfile(requestWithToken(token))).toEqual(
				verificationFailure,
			);
		},
	);

	it('accepts a numeric string expiry in the signed ALB header', async () => {
		const token = makeJwt(
			JSON.stringify(profile),
			makeHeader({ exp: String(Math.floor(Date.now() / 1000) + 3600) }),
		);
		expect(await getUserProfile(requestWithToken(token))).toEqual({ profile });
	});

	it.each(['../../private-key', 'https://attacker.example/key', undefined])(
		'rejects an invalid key ID without requesting it: %s',
		async (invalidKid) => {
			const token = makeJwt(
				JSON.stringify(profile),
				makeHeader({ kid: invalidKid }),
			);
			expect(await getUserProfile(requestWithToken(token))).toEqual(
				verificationFailure,
			);
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);

	it('rejects the JWT if the public key cannot be fetched', async () => {
		fetchMock.mockRejectedValue(new Error('Public key endpoint unavailable'));
		expect(await getUserProfile(requestWithToken(makeJwt()))).toEqual(
			verificationFailure,
		);
		expect(console.warn).toHaveBeenCalled();
	});

	it('rejects the JWT if the public key response is invalid', async () => {
		fetchMock.mockResolvedValue(
			new TextEncoder().encode('not a public key').buffer,
		);
		expect(await getUserProfile(requestWithToken(makeJwt()))).toEqual(
			verificationFailure,
		);
	});

	it('reuses the fetched key for subsequent JWTs with the same key ID', async () => {
		const token = makeJwt();
		expect(await getUserProfile(requestWithToken(token))).toEqual({ profile });
		expect(await getUserProfile(requestWithToken(token))).toEqual({ profile });
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it.each(['ALB_ARN', 'GOOGLE_CLIENT_ID'])(
		'rejects JWTs when trusted configuration %s is missing',
		async (variable) => {
			delete process.env[variable];
			expect(await getUserProfile(requestWithToken(makeJwt()))).toEqual(
				verificationFailure,
			);
			expect(console.warn).toHaveBeenCalled();
		},
	);

	it('preserves the explicit local developer-profile bypass', async () => {
		process.env.USE_DEVELOPER_PROFILE = 'true';
		process.env.LOCAL_USER_PROFILE_NAME = 'Local Developer';
		process.env.LOCAL_USER_PROFILE_EMAIL = 'developer@guardian.co.uk';
		expect(await getUserProfile(requestWithToken('not-a-jwt'))).toEqual({
			profile: {
				name: 'Local Developer',
				email: 'developer@guardian.co.uk',
			},
		});
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('verifies a configured fake JWT rather than trusting its payload', async () => {
		process.env.USE_FAKE_JWT = 'true';
		process.env.FAKE_JWT = makeJwt(
			JSON.stringify(profile),
			makeHeader(),
			otherKeyPair.privateKey,
		);
		expect(await getUserProfile(requestWithToken())).toEqual(
			verificationFailure,
		);
	});

	it('uses a correctly signed configured JWT when no header is present', async () => {
		process.env.USE_FAKE_JWT = 'true';
		process.env.FAKE_JWT = makeJwt();
		expect(await getUserProfile(requestWithToken())).toEqual({ profile });
	});
});

describe('JWT verification toggle', () => {
	it.each([undefined, 'false', '', 'TRUE', '1'])(
		'decodes without verification or AWS configuration when the flag is %j',
		async (value) => {
			if (value === undefined) {
				delete process.env.ENABLE_JWT_VERIFICATION;
			} else {
				process.env.ENABLE_JWT_VERIFICATION = value;
			}
			delete process.env.ALB_ARN;
			delete process.env.GOOGLE_CLIENT_ID;
			const createVerifierMock = jest.spyOn(AlbJwtVerifier, 'create');
			const token = makeJwt(
				JSON.stringify(profile),
				makeHeader(),
				otherKeyPair.privateKey,
			);

			expect(await getUserProfile(requestWithToken(token))).toEqual({
				profile,
			});
			expect(createVerifierMock).not.toHaveBeenCalled();
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);

	it('verifies signatures when the flag is true', async () => {
		const token = makeJwt(
			JSON.stringify(profile),
			makeHeader(),
			otherKeyPair.privateKey,
		);

		expect(await getUserProfile(requestWithToken(token))).toEqual(
			verificationFailure,
		);
		expect(fetchMock).toHaveBeenCalled();
	});

	it.each(['{', 'null', '[]', '{"sub":42}', '{"sub":"user","email":42}'])(
		'still rejects invalid profile JSON when verification is disabled: %s',
		async (payloadJson) => {
			process.env.ENABLE_JWT_VERIFICATION = 'false';

			expect(
				await getUserProfile(requestWithToken(makeJwt(payloadJson))),
			).toEqual(verificationFailure);
			expect(fetchMock).not.toHaveBeenCalled();
		},
	);

	it('decodes the fallback JWT without verification when disabled', async () => {
		process.env.ENABLE_JWT_VERIFICATION = 'false';
		process.env.USE_FAKE_JWT = 'true';
		process.env.FAKE_JWT = makeJwt(
			JSON.stringify(profile),
			makeHeader(),
			otherKeyPair.privateKey,
		);

		expect(await getUserProfile(requestWithToken())).toEqual({ profile });
		expect(fetchMock).not.toHaveBeenCalled();
	});
});
