import { newslettersDataClient } from './newsletters-data-client';

describe('newslettersDataClient', () => {
  it('should work', () => {
    expect(newslettersDataClient()).toEqual('newsletters-data-client');
  });
});
