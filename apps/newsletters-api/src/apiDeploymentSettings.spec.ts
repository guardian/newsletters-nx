import {
	isServingReadEndpoints,
	isServingReadWriteEndpoints,
	isServingUI,
	isUndefinedAndNotProduction,
	isUsingInMemoryStorage,
} from './apiDeploymentSettings';

const ORIGINAL_ENV = process.env;
beforeEach(() => {
	jest.resetModules();
	process.env = { ...ORIGINAL_ENV };
});
afterEach(() => {
	process.env = ORIGINAL_ENV;
});

describe('isUndefinedAndNotProduction', () => {
	it('returns false when environment variable is undefined and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		const result = isUndefinedAndNotProduction(undefined);
		expect(result).toBe(false);
	});
	it('returns true when environment variable is undefined and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		expect(isUndefinedAndNotProduction(undefined)).toBe(true);
	});
	it('returns false when environment variable is not undefined and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		expect(isUndefinedAndNotProduction('true')).toBe(false);
	});
	it('returns false when environment variable is not undefined and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		expect(isUndefinedAndNotProduction('false')).toBe(false);
	});
});

describe('isServingUI', () => {
	it('returns false when NEWSLETTERS_UI_SERVE is undefined and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		process.env.NEWSLETTERS_UI_SERVE = undefined;
		expect(isServingUI()).toBe(false);
	});
	it('returns true when NEWSLETTERS_UI_SERVE is undefined and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		process.env.NEWSLETTERS_UI_SERVE = undefined;
		expect(isServingUI()).toBe(true);
	});
	it('returns true when NEWSLETTERS_UI_SERVE is true and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		process.env.NEWSLETTERS_UI_SERVE = 'true';
		expect(isServingUI()).toBe(true);
	});
	it('returns true when NEWSLETTERS_UI_SERVE is true and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		process.env.NEWSLETTERS_UI_SERVE = 'true';
		expect(isServingUI()).toBe(true);
	});
	it('returns false when NEWSLETTERS_UI_SERVE is false and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		process.env.NEWSLETTERS_UI_SERVE = 'false';
		expect(isServingUI()).toBe(false);
	});
	it('returns false when NEWSLETTERS_UI_SERVE is false and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		process.env.NEWSLETTERS_UI_SERVE = 'false';
		expect(isServingUI()).toBe(false);
	});
});

describe('isServingReadEndpoints', () => {
	it('returns false when NEWSLETTERS_API_READ and NEWSLETTERS_API_READ_WRITE are undefined and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		process.env.NEWSLETTERS_API_READ = undefined;
		process.env.NEWSLETTERS_API_READ_WRITE = undefined;
		expect(isServingReadEndpoints()).toBe(false);
	});
	it('returns true when NEWSLETTERS_API_READ and NEWSLETTERS_API_READ_WRITE are undefined and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		process.env.NEWSLETTERS_API_READ = undefined;
		process.env.NEWSLETTERS_API_READ_WRITE = undefined;
		expect(isServingReadEndpoints()).toBe(true);
	});
	it('returns true when NEWSLETTERS_API_READ is true and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		process.env.NEWSLETTERS_API_READ = 'true';
		expect(isServingReadEndpoints()).toBe(true);
	});
	it('returns true when NEWSLETTERS_API_READ is true and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		process.env.NEWSLETTERS_API_READ = 'true';
		expect(isServingReadEndpoints()).toBe(true);
	});
	it('returns true when NEWSLETTERS_API_READ_WRITE is true and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		process.env.NEWSLETTERS_API_READ_WRITE = 'true';
		expect(isServingReadEndpoints()).toBe(true);
	});
	it('returns true when NEWSLETTERS_API_READ_WRITE is true and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		process.env.NEWSLETTERS_API_READ_WRITE = 'true';
		expect(isServingReadEndpoints()).toBe(true);
	});
	it('returns false when NEWSLETTERS_API_READ and NEWSLETTERS_API_READ_WRITE are false and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		process.env.NEWSLETTERS_API_READ = 'false';
		process.env.NEWSLETTERS_API_READ_WRITE = 'false';
		expect(isServingReadEndpoints()).toBe(false);
	});
	it('returns false when NEWSLETTERS_API_READ and NEWSLETTERS_API_READ_WRITE are false and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		process.env.NEWSLETTERS_API_READ = 'false';
		process.env.NEWSLETTERS_API_READ_WRITE = 'false';
		expect(isServingReadEndpoints()).toBe(false);
	});
});

describe('isServingReadWriteEndpoints', () => {
	it('returns false when NEWSLETTERS_API_READ_WRITE is undefined and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		process.env.NEWSLETTERS_API_READ_WRITE = undefined;
		expect(isServingReadWriteEndpoints()).toBe(false);
	});
	it('returns true when NEWSLETTERS_API_READ_WRITE is undefined and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		process.env.NEWSLETTERS_API_READ_WRITE = undefined;
		expect(isServingReadWriteEndpoints()).toBe(true);
	});
	it('returns true when NEWSLETTERS_API_READ_WRITE is true and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		process.env.NEWSLETTERS_API_READ_WRITE = 'true';
		expect(isServingReadWriteEndpoints()).toBe(true);
	});
	it('returns true when NEWSLETTERS_API_READ_WRITE is true and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		process.env.NEWSLETTERS_API_READ_WRITE = 'true';
		expect(isServingReadWriteEndpoints()).toBe(true);
	});
	it('returns false when NEWSLETTERS_API_READ_WRITE is false and NODE_ENV is production', () => {
		process.env.NODE_ENV = 'production';
		process.env.NEWSLETTERS_API_READ_WRITE = 'false';
		expect(isServingReadWriteEndpoints()).toBe(false);
	});
	it('returns false when NEWSLETTERS_API_READ_WRITE is false and NODE_ENV is not production', () => {
		process.env.NODE_ENV = 'development';
		process.env.NEWSLETTERS_API_READ_WRITE = 'false';
		expect(isServingReadWriteEndpoints()).toBe(false);
	});
});

describe('isUsingInMemoryStorage', () => {
	it('returns false where USE_IN_MEMORY_STORAGE is not set', () => {
		expect(isUsingInMemoryStorage()).toBe(false);
	});
	it('returns false where USE_IN_MEMORY_STORAGE is false', () => {
		process.env.USE_IN_MEMORY_STORAGE = 'false';
		expect(isUsingInMemoryStorage()).toBe(false);
	});
	it('returns true where USE_IN_MEMORY_STORAGE is true', () => {
		process.env.USE_IN_MEMORY_STORAGE = 'true';
		expect(isUsingInMemoryStorage()).toBe(true);
	});
	it('returns false if USE_IN_MEMORY_STORAGE is something other than true or false', () => {
		process.env.USE_IN_MEMORY_STORAGE = 'foo';
		expect(isUsingInMemoryStorage()).toBe(false);
	});
});
