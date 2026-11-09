import { generateKeyPairSync, randomUUID, sign } from 'node:crypto';
import { AlbJwtVerifier } from 'aws-jwt-verify';
import { SimpleFetcher } from 'aws-jwt-verify/https';
import { getUserProfile, getUserProfileFromJWT } from './get-user-profile';

const originalEnv = process.env;
const albArn =
	'arn:aws:elasticloadbalancing:eu-west-1:123456789012:loadbalancer/app/newsletters-tool/1234567890abcdef';
const clientId = 'newsletters-test-client';
const issuer = 'https://accounts.google.com';
const profile = {
	// The iss field is copied from the JWT header to the payload by the ALB for us, see
	// https://github.com/awslabs/aws-jwt-verify/issues/303#issuecomment-6176237542
	iss: issuer,
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
	iss: issuer,
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

const loadFailure = {
	errorMessage: 'Failed to load user profile.',
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
	jest.spyOn(console, 'log').mockImplementation(() => undefined);
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
		expect(await getUserProfile(requestWithToken())).toEqual(loadFailure);
	});

	it('uses a correctly signed configured JWT when no header is present', async () => {
		process.env.USE_FAKE_JWT = 'true';
		process.env.FAKE_JWT = makeJwt();
		expect(await getUserProfile(requestWithToken())).toEqual({ profile });
	});

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

describe('getUserProfileFromJWT', () => {
	it.each([true, false])(
		'accepts a correctly signed ES256 JWT (base64 padding: %s)',
		async (padded) => {
			const token = makeJwt(
				JSON.stringify(profile),
				makeHeader(),
				privateKey,
				padded,
			);
			expect(await getUserProfileFromJWT(token)).toEqual({
				profile,
			});
			expect(fetchMock).toHaveBeenCalledWith(
				`https://public-keys.auth.elb.eu-west-1.amazonaws.com/${kid}`,
			);
		},
	);

	it('downloads JWKs only once when verifying the same JWT repeatedly', async () => {
		const token = makeJwt();

		for (let attempt = 0; attempt < 3; attempt++) {
			expect(await getUserProfileFromJWT(token)).toEqual({ profile });
		}

		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(fetchMock).toHaveBeenCalledWith(
			`https://public-keys.auth.elb.eu-west-1.amazonaws.com/${kid}`,
		);
	});

	it.each(['{', '', 'undefined', '{"sub":'])(
		'rejects signed payloads containing invalid JSON: %j',
		async (payloadJson) => {
			expect(await getUserProfileFromJWT(makeJwt(payloadJson))).toEqual(
				loadFailure,
			);
		},
	);

	it.each([
		null,
		[],
		[profile],
		'editor',
		42,
		true,
		{ ...profile, sub: 42 },
		{ ...profile, exp: 'not-a-timestamp' },
	])(
		'rejects a signed payload with an invalid JWT structure or claim type: %j',
		async (payload) => {
			expect(
				await getUserProfileFromJWT(makeJwt(JSON.stringify(payload))),
			).toEqual(loadFailure);
		},
	);

	it.each([null, [], 'header', 42])(
		'rejects a JWT whose header is not a JSON object: %j',
		async (header) => {
			expect(
				await getUserProfileFromJWT(makeJwt(JSON.stringify(profile), header)),
			).toEqual(loadFailure);
		},
	);

	it.each(['not-a-jwt', 'header.payload', 'header.payload.signature.extra'])(
		'rejects a malformed JWT: %s',
		async (token) => {
			expect(await getUserProfileFromJWT(token)).toEqual(loadFailure);
		},
	);

	it('rejects malformed JSON in the header', async () => {
		const token = makeJwt().split('.');
		token[0] = encode('{', true);
		expect(await getUserProfileFromJWT(token.join('.'))).toEqual(loadFailure);
	});

	it('rejects a JWT signed with a different private key', async () => {
		const token = makeJwt(
			JSON.stringify(profile),
			makeHeader(),
			otherKeyPair.privateKey,
		);
		expect(await getUserProfileFromJWT(token)).toEqual(loadFailure);
	});

	it('rejects a modified payload even if it is a valid profile', async () => {
		const token = makeJwt().split('.');
		token[1] = encode(
			JSON.stringify({ ...profile, email: 'another@guardian.co.uk' }),
			true,
		);
		expect(await getUserProfileFromJWT(token.join('.'))).toEqual(loadFailure);
	});

	it('rejects a modified signed header', async () => {
		const token = makeJwt().split('.');
		token[0] = encode(
			JSON.stringify(makeHeader({ exp: Math.floor(Date.now() / 1000) + 7200 })),
			true,
		);
		expect(await getUserProfileFromJWT(token.join('.'))).toEqual(loadFailure);
	});

	it('rejects an unsigned JWT', async () => {
		const token = makeJwt().split('.');
		token[2] = '';
		expect(await getUserProfileFromJWT(token.join('.'))).toEqual(loadFailure);
	});

	it.each(['ALB_ARN', 'GOOGLE_CLIENT_ID'])(
		'rejects JWTs when trusted configuration %s is missing',
		async (variable) => {
			delete process.env[variable];
			expect(await getUserProfileFromJWT(makeJwt())).toEqual(loadFailure);
			expect(console.log).toHaveBeenCalledWith(
				expect.stringContaining(
					'"message":"Failed to load user profile from JWT"',
				),
			);
		},
	);

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

				expect(await getUserProfileFromJWT(token)).toEqual({
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

			expect(await getUserProfileFromJWT(token)).toEqual(loadFailure);
			expect(fetchMock).toHaveBeenCalled();
		});

		it.each(['{', 'null', '[]', '{"sub":42}', '{"exp":"not-a-timestamp"}'])(
			'still rejects invalid JWT payloads when verification is disabled: %s',
			async (payloadJson) => {
				process.env.ENABLE_JWT_VERIFICATION = 'false';

				expect(await getUserProfileFromJWT(makeJwt(payloadJson))).toEqual(
					loadFailure,
				);
				expect(fetchMock).not.toHaveBeenCalled();
			},
		);
	});
});
