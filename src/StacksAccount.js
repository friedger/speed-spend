import React from 'react';
import {
  createStacksPrivateKey,
  getPublicKey,
  addressFromPublicKeys,
  AddressVersion,
  AddressHashMode,
  StacksTestnet,
} from '@blockstack/stacks-transactions';
import { STX_JSON_PATH } from './UserSession';

export const NETWORK = new StacksTestnet();
NETWORK.coreApiUrl = 'https://sidecar.staging.blockstack.xyz';

export const CONTRACT_ADDRESS = 'ST12EY99GS4YKP0CP2CFW6SEPWQ2CGVRWK5GHKDRV';

export const STACK_API_URL = 'https://sidecar.staging.blockstack.xyz/v2/transactions';
export const STACKS_API_ACCOUNTS_URL = 'https://sidecar.staging.blockstack.xyz/v2/accounts';
export const STACKS_API_ACCOUNTS_BROWSER_URL =
  'http://testnet-master.blockstack.org:20443/v2/accounts';

export function getStacksAccount(appPrivateKey) {
  const privateKey = createStacksPrivateKey(appPrivateKey);
  const publicKey = getPublicKey(privateKey);
  const address = addressFromPublicKeys(
    AddressVersion.TestnetSingleSig,
    AddressHashMode.SerializeP2PKH,
    1,
    [publicKey]
  );
  return { privateKey, address };
}

export async function getUserAddress(userSession, username) {
  return userSession
    .getFile(STX_JSON_PATH, {
      decrypt: false,
      username: username,
    })
    .then(r => JSON.parse(r))
    .catch(e => console.log(e));
}

export function fetchAccount(addressAsString) {
  console.log('Checking account');
  const balanceUrl = `${STACKS_API_ACCOUNTS_URL}/${addressAsString}`;
  return fetch(balanceUrl).then(r => {
    console.log({ r });
    return r.json();
  });
}

export function resultToStatus(result) {
  if (result && result.startsWith('"') && result.length === 66) {
    const txid = result.substr(1, 64);
    return (
      <>
        Check transaction status:
        <a href={`https://testnet-explorer.blockstack.org/txid/0x${txid}`}>{txid}</a>
      </>
    );
  } else {
    return result;
  }
}
