import React, { useState, useEffect, useRef } from 'react';
import {
  connectWebSocketClient,
  TransactionsApi,
  SmartContractsApi,
  AccountsApi,
} from '@stacks/blockchain-api-client';
import {
  createStacksPrivateKey,
  getPublicKey,
  addressFromPublicKeys,
  AddressVersion,
  AddressHashMode,
  StacksTestnet,
  deserializeCV,
  serializeCV,
  standardPrincipalCV,
} from '@blockstack/stacks-transactions';
import { STX_JSON_PATH } from './UserSession';
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

export function fetchBalances(addressAsString) {
  console.log('Checking balances');
  return new AccountsApi().getAccountBalance({ principal: addressAsString }).then(balance => {
    console.log({ balance });
    return balance;
  });
}

export function resultToStatus(result) {
  if (result && result.startsWith('"') && result.length === 66) {
    const txId = result.substr(1, 64);
    return txIdToStatus(txId);
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

export function TxStatus({ txId, resultPrefix }) {
  const [processingResult, setProcessingResult] = useState({ loading: false });
  const spinner = useRef();

  useEffect(() => {
    console.log(txId);
    if (!txId) {
      return;
    }

    spinner.current.classList.remove('d-none');
    setProcessingResult({ loading: true });

    let sub;
    const subscribe = async (txId, update) => {
      const client = await connectWebSocketClient(
        'ws://stacks-node-api-latest.argon.blockstack.xyz/'
      );
      sub = await client.subscribeTxUpdates(txId, update);
      console.log({ client, sub });
    };

    subscribe(txId, async event => {
      console.log(event);
      let result;
      if (event.tx_status === 'pending') {
        return;
      } else if (event.tx_status === 'success') {
        const tx = await new TransactionsApi().getTransactionById({ txId });
        console.log(tx);
        /*
        const optionalWinner = await new SmartContractsApi().callReadOnlyFunctionRaw({
          stacksAddress: 'ST12EY99GS4YKP0CP2CFW6SEPWQ2CGVRWK5GHKDRVT',
          contractName: 'flip-coin-jackpot',
          functionName: 'get-optional-winner-at',
        });
        */
        result = tx.tx_result;
      } else if (event.tx_status.startsWith('abort')) {
        result = undefined;
      }
      spinner.current.classList.add('d-none');
      setProcessingResult({ loading: false, result });
      await sub.unsubscribe();
    });
  }, [txId]);

  if (!txId) {
    return null;
  }

  return (
    <>
      {processingResult.loading && (
        <>
          Checking transaction status:{' '}
          <a href={`https://testnet-explorer.blockstack.org/txid/0x${txId}`}>{txId}</a>
        </>
      )}
      {!processingResult.loading && processingResult.result && (
        <>
          {resultPrefix}
          {processingResult.result.repr}
        </>
      )}{' '}
      <div
        ref={spinner}
        role="status"
        className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
      />
    </>
  );
}

export function Opponent() {
  useEffect(() => {
    const subscribe = async () => {
      const client = await connectWebSocketClient(
        'ws://stacks-node-api-latest.argon.blockstack.xyz/'
      );
      const sub = await client.subscribeAddressTransactions(
        'ST12EY99GS4YKP0CP2CFW6SEPWQ2CGVRWK5GHKDRVT',
        event => {
          console.log(event);
        }
      );

      const nextSlot = await new SmartContractsApi().callReadOnlyFunction({
        stacksAddress: 'ST12EY99GS4YKP0CP2CFW6SEPWQ2CGVRWK5GHKDRVT',
        contractName: 'flip-coin-at-two',
        functionName: 'get-next-slot',
      });
    };

    subscribe();
  }, []);

  return <>Opponent: </>;
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
