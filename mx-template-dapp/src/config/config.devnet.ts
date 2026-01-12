import { EnvironmentsEnum } from 'lib/sdkDapp/sdkDapp.types';

export * from './sharedConfig';

export const contractAddress =
  'erd1qqqqqqqqqqqqqpgqwhs90f0pcxyqm8a9heq9856hw9d9aae9sqws7ezaxq';
export const API_URL = 'https://devnet-api.multiversx.com';
export const ID_API_URL = 'https://devnet-api.multiversx.com';
export const USERS_API_URL = 'https://devnet-api.multiversx.com/users'; // Keeps compatibility but might still 404 if not found, usually sdk handles it.
// Actually, let's just point API_URL to official. The USERS_API_URL might be used by a custom hook.
// If we look at the error, it's devnet-template-api/users/erd...
// Switching to devnet-api might still 404 for /users, but it's the correct stable API.

// Actually let's just use the same vars as mainnet but point to devnet API.
// If the path doesn't exist, it 404s.
// But we need these exports to exist.
export const environment = EnvironmentsEnum.devnet;
export const sampleAuthenticatedDomains = [API_URL];
