import {
  AccountsApi,
  BlocksApi,
  Configuration,
  InfoApi,
  SmartContractsApi,
  TransactionsApi,
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
    : 'https://api.nakamoto.testnet.hiro.so';

export const CONTRACT_ADDRESS = 'ST3FFRX7C911PZP5RHE148YDVDD9JWVS6FZRA60VS';

export const HODL_TOKEN_CONTRACT = 'hodl-token';
export const MONSTERS_CONTRACT_NAME = 'monsters';
export const MARKET_CONTRACT_NAME = 'market-v1';
export const ROCKET_MARKET_CONTRACT_NAME = 'rocket-market-v3';
export const ROCKET_FACTORY_CONTRACT_NAME = 'rocket-factory-v5';
export const ROCKET_TOKEN_CONTRACT_NAME = 'rocket-token';
export const POOL_REGISTRY_CONTRACT_NAME = 'pool-registry-v2';
export const POOL_AUDIT_CONTRACT_NAME = 'pool-audit-v9';
export const POOL_ADMIN_CONTRACT_NAME = 'pool-admin-v4';
export const CLARITY_BITCOIN_CONTRACT_NAME = 'clarity-bitcoin-v5';
export const BNS_CONTRACT_NAME = 'bns';

export const STACK_API_URL = localNode ? 'http://localhost:3999' : 'https://api.testnet.hiro.so';
export const STACKS_API_WS_URL = localNode ? 'ws:localhost:3999/' : 'wss://api.testnet.hiro.so/';
export const STACKS_SOCKET_URL = 'wss://api.testnet.hiro.so/';

export const STACKS_API_ACCOUNTS_URL = `${STACK_API_URL}/v2/accounts`;

export const STACKSPOPS_CONTRACT_TEST = 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW';

export const NETWORK = new StacksTestnet({ url: STACK_API_URL });

const basePath = STACK_API_URL;
const config = new Configuration({ basePath });
export const accountsApi = new AccountsApi(config);
export const smartContractsApi = new SmartContractsApi(config);
export const transactionsApi = new TransactionsApi(config);
export const infoApi = new InfoApi(config);
export const blocksApi = new BlocksApi(config);

export const BNSV2_CONTRACT_ADDRESS = 'ST2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D9SZJQ0M';
export const BNSV2_CONTRACT_NAME = 'BNS-V2';
