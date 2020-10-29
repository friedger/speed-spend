import {
  TransactionsApi,
  SmartContractsApi,
  AccountsApi,
  Configuration,
} from '@stacks/blockchain-api-client';
import { StacksTestnet } from '@stacks/transactions';

export const localMocknet = window.location.search.includes('mocknet=local');
export const localNode = localMocknet;
export const localAuth = false;
export const mocknet = localMocknet;

console.log({ localNode, localAuth, mocknet });
export const authOrigin = localAuth ? 'http://localhost:8080' : 'https://app.blockstack.org';

export const CONTRACT_ADDRESS = mocknet
  ? 'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6' //ADDR1 from Stacks.toml
  : 'ST12EY99GS4YKP0CP2CFW6SEPWQ2CGVRWK5GHKDRV';
export const HODL_TOKEN_CONTRACT = 'hodl-token';
export const MONSTERS_CONTRACT_NAME = 'monsters';
export const STACK_API_URL = localNode
  ? 'http://localhost:3999'
  : 'https://stacks-node-api.krypton.blockstack.org';
export const STACKS_API_WS_URL = localNode
  ? 'ws:localhost:3999/'
  : 'ws://stacks-node-api.blockstack.org/';
export const STACKS_API_ACCOUNTS_URL = `${STACK_API_URL}/v2/accounts`;

export const NETWORK = new StacksTestnet();
NETWORK.coreApiUrl = STACK_API_URL;

const basePath = STACK_API_URL;
const config = new Configuration({ basePath });
export const accountsApi = new AccountsApi(config);
export const smartContractsApi = new SmartContractsApi(config);
export const transactionsApi = new TransactionsApi(config);
