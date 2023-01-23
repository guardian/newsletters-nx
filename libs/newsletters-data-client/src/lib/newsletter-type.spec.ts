import { VALID_TECHSCAPE } from '../fixtures/newsletter-fixtures';
import type {
  CancelledNewsletter,
  Newsletter} from './newsletter-type';
import {
  isCancelledNewsletter,
  isNewsletter
} from './newsletter-type';

describe('isNewsletter', () => {
  it('Will return true for a valid newsletter', () => {
    expect(isNewsletter(VALID_TECHSCAPE)).toBe(true);
  });

  it('Will return false for any falsy input or non-object', () => {
    expect(isNewsletter(false)).toBe(false);
    expect(isNewsletter(null)).toBe(false);
    expect(isNewsletter(undefined)).toBe(false);
    expect(isNewsletter(0)).toBe(false);
    expect(isNewsletter(10)).toBe(false);
    expect(isNewsletter('')).toBe(false);
    expect(isNewsletter('unexpected string')).toBe(false);
  });

  it('Will return false for non-matching object', () => {
    expect(isNewsletter({})).toBe(false);
    expect(isNewsletter({ id: 'foo' })).toBe(false);
    expect(isNewsletter(new Error('Runtime problem'))).toBe(false);
  });

  it('Requires the identityName to be defined and not an empty string', () => {
    const techscapeWithEmptyIdentityName: Newsletter = {
      ...VALID_TECHSCAPE,
      identityName: '',
    };
    const techscapeWithNoIdentityName = {
      ...VALID_TECHSCAPE,
      identityName: undefined,
    };
    expect(isNewsletter(techscapeWithEmptyIdentityName)).toBe(false);
    expect(isNewsletter(techscapeWithNoIdentityName)).toBe(false);
  });

  it('Requires a desciption', () => {
    const techscapeWithEmptyDescription: Newsletter = {
      ...VALID_TECHSCAPE,
      description: '',
    };
    const techscapeWithNoDescription = {
      ...VALID_TECHSCAPE,
      description: undefined,
    };
    expect(isNewsletter(techscapeWithEmptyDescription)).toBe(false);
    expect(isNewsletter(techscapeWithNoDescription)).toBe(false);
  });
});

describe('isCancelledNewsletter', () => {
  it('Only returns true if the newsletter is set to cancelled', () => {
    const cancelledTechscape = { ...VALID_TECHSCAPE, cancelled: true };
    expect(isCancelledNewsletter(VALID_TECHSCAPE)).toBe(false);
    expect(isCancelledNewsletter(cancelledTechscape)).toBe(true);
  });

  it('allows the description to be missing', () => {
    const techscapeWithEmptyDescription: CancelledNewsletter = {
      ...VALID_TECHSCAPE,
      description: '',
      cancelled: true,
    };
    const techscapeWithNoDescription = {
      ...VALID_TECHSCAPE,
      description: undefined,
      cancelled: true,
    };
    expect(isCancelledNewsletter(techscapeWithEmptyDescription)).toBe(true);
    expect(isCancelledNewsletter(techscapeWithNoDescription)).toBe(true);
  });
});
