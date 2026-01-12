import { EnvironmentsEnum } from 'lib/sdkDapp/sdkDapp.types';

export * from './sharedConfig';

export const contractAddress =
  'erd1qqqqqqqqqqqqqpgqwhs90f0pcxyqm8a9heq9856hw9d9aae9sqws7ezaxq';
export const API_URL = 'https://devnet-template-api.multiversx.com';
export const ID_API_URL = 'https://devnet-template-api.multiversx.com';
export const USERS_API_URL = '/users/'; // Valid path on API often just /users/ for herotag? No.
// Actually let's just use the same vars as mainnet but point to devnet API.
// If the path doesn't exist, it 404s.
// But we need these exports to exist.
export const environment = EnvironmentsEnum.devnet;
export const sampleAuthenticatedDomains = [API_URL];
