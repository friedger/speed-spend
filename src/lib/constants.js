import {
  TransactionsApi,
  SmartContractsApi,
  AccountsApi,
  Configuration,
  InfoApi,
  BlocksApi,
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
export const MONSTERS_CONTRACT_NAME = 'monsters-v1';
export const MARKET_CONTRACT_NAME = 'market-v1';
export const ROCKET_MARKET_CONTRACT_NAME = 'rocket-market-v3';
export const ROCKET_FACTORY_CONTRACT_NAME = 'rocket-factory-v5';
export const ROCKET_TOKEN_CONTRACT_NAME = 'rocket-token';
export const POOL_REGISTRY_CONTRACT_NAME = 'pool-registry-v2';
export const POOL_AUDIT_CONTRACT_NAME = 'pool-audit-v8';
export const POOL_ADMIN_CONTRACT_NAME = 'pool-admin-v4';
export const CLARITY_BITCOIN_CONTRACT_NAME = "clarity-bitcoin-v4"
export const GENESIS_CONTRACT_ADDRESS = 'ST000000000000000000002AMW42H';
export const BNS_CONTRACT_NAME = 'bns';

export const STACK_API_URL = localNode
  ? 'http://localhost:3999'
  : 'https://stacks-node-api.testnet.stacks.co';
export const STACKS_API_WS_URL = localNode
  ? 'ws:localhost:3999/'
  : 'ws://stacks-node-api.testnet.stacks.co/';
export const STACKS_API_ACCOUNTS_URL = `${STACK_API_URL}/v2/accounts`;

export const NETWORK = new StacksTestnet();
NETWORK.coreApiUrl = STACK_API_URL;

const basePath = STACK_API_URL;
const config = new Configuration({ basePath });
export const accountsApi = new AccountsApi(config);
export const smartContractsApi = new SmartContractsApi(config);
export const transactionsApi = new TransactionsApi(config);
export const infoApi = new InfoApi(config);
export const blocksApi = new BlocksApi(config);
