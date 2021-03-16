import {
  TransactionsApi,
  SmartContractsApi,
  AccountsApi,
  Configuration,
  InfoApi,
} from '@stacks/blockchain-api-client';
import { StacksTestnet } from '@stacks/network';

export const localMocknet = window.location.search.includes('mocknet=local');
export const beta = window.location.search.includes('authorigin=beta');
export const localNode = localMocknet;
export const localAuth = false;
export const mocknet = localMocknet;

console.log({ localNode, localAuth, beta, mocknet });
export const authOrigin = localAuth
  ? 'http://localhost:8080'
  : beta
  ? 'https://pr-725.app.stacks.engineering/'
  : 'https://app.blockstack.org';

export const CONTRACT_ADDRESS = mocknet
  ? 'STB44HYPYAT2BB2QE513NSP81HTMYWBJP02HPGK6' //ADDR1 from Stacks.toml
  : 'ST33GW755MQQP6FZ58S423JJ23GBKK5ZKH3MGR55N';
export const HODL_TOKEN_CONTRACT = 'hodl-token';
export const MONSTERS_CONTRACT_NAME = 'monsters';
export const STACK_API_URL = localNode
  ? 'http://localhost:3999'
  : 'https://stacks-node-api.xenon.blockstack.org';
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
export const infoApi = new InfoApi(config);
