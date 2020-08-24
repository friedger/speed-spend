import React from 'react';
import {
  createStacksPrivateKey,
  getPublicKey,
  addressFromPublicKeys,
  AddressVersion,
  AddressHashMode,
  StacksTestnet,
  deserializeCV,
  serializeCV,
} from '@blockstack/stacks-transactions';
import { STX_JSON_PATH } from './UserSession';
import { standardPrincipalCV } from '@blockstack/stacks-transactions';

export const NETWORK = new StacksTestnet();
NETWORK.coreApiUrl = 'https://sidecar.staging.blockstack.xyz';

export const CONTRACT_ADDRESS = 'ST12EY99GS4YKP0CP2CFW6SEPWQ2CGVRWK5GHKDRV';
export const HODL_TOKEN_CONTRACT = 'hodl-token';
export const STACK_API_URL = 'https://sidecar.staging.blockstack.xyz';
export const STACKS_API_ACCOUNTS_URL = `${STACK_API_URL}/v2/accounts`;
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
    .catch(e => console.log(e, username));
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
    const txId = result.substr(1, 64);
    txIdToStatus(txId);
  } else {
    return result;
  }
}

export function txIdToStatus(txId) {
  return (
    <>
      Check transaction status:{' '}
      <a href={`https://testnet-explorer.blockstack.org/txid/0x${txId}`}>{txId}</a>
    </>
  );
}

export function fetchJackpot(sender) {
  return fetch(
    `${NETWORK.coreApiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/flip-coin-jackpot/get-jackpot`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `{"sender":"${sender}","arguments":[]}`,
    }
  )
    .then(response => response.json())
    .then(getJackpot => {
      console.log({ getJackpot });
      if (getJackpot.okay) {
        const cv = deserializeCV(Buffer.from(getJackpot.result.substr(2), 'hex'));
        if (cv.value) {
          return cv.value;
        } else {
          return undefined;
        }
      }
    });
}

export function fetchHodlTokenBalance(sender) {
  console.log(sender);
  return fetch(
    `${NETWORK.coreApiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${HODL_TOKEN_CONTRACT}/hodl-balance-of`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `{"sender":"${sender}","arguments":["0x${serializeCV(
        new standardPrincipalCV(sender)
      ).toString('hex')}"]}`,
    }
  )
    .then(async response => {
      return response.json();
    })
    .then(hodlBalanceOf => {
      console.log({ hodlBalanceOf });
      if (hodlBalanceOf.okay) {
        const cv = deserializeCV(Buffer.from(hodlBalanceOf.result.substr(2), 'hex'));
        console.log(cv);
        if (cv.value) {
          return cv.value.toString(10);
        } else {
          return undefined;
        }
      }
    });
}

export function fetchSpendableTokenBalance(sender) {
  return fetch(
    `${NETWORK.coreApiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${HODL_TOKEN_CONTRACT}/spendable-balance-of`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `{"sender":"${sender}","arguments":["0x${serializeCV(
        new standardPrincipalCV(sender)
      ).toString('hex')}"]}`,
    }
  )
    .then(response => response.json())
    .then(hodlBalanceOf => {
      console.log({ hodlBalanceOf });
      if (hodlBalanceOf.okay) {
        const cv = deserializeCV(Buffer.from(hodlBalanceOf.result.substr(2), 'hex'));
        if (cv.value) {
          return cv.value.toString(10);
        } else {
          return undefined;
        }
      }
    });
}
