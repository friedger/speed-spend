import { TransactionsApi, SmartContractsApi, AccountsApi } from '@stacks/blockchain-api-client';
import { StacksTestnet } from '@blockstack/stacks-transactions';
export const NETWORK = new StacksTestnet();
NETWORK.coreApiUrl = 'https://sidecar.staging.blockstack.xyz';

export const CONTRACT_ADDRESS = 'ST12EY99GS4YKP0CP2CFW6SEPWQ2CGVRWK5GHKDRV';
export const HODL_TOKEN_CONTRACT = 'hodl-token';
export const MONSTERS_CONTRACT_NAME = 'monsters';
export const STACK_API_URL = 'https://sidecar.staging.blockstack.xyz';
export const STACKS_API_ACCOUNTS_URL = `${STACK_API_URL}/v2/accounts`;
export const STACKS_API_ACCOUNTS_BROWSER_URL =
  'http://testnet-master.blockstack.org:20443/v2/accounts';
export const ARGON_API_URL = 'https://stacks-node-api-latest.argon.blockstack.xyz';

export const accountsApi = new AccountsApi();
export const smartContractsApi = new SmartContractsApi();
export const transactionsApi = new TransactionsApi();
