import { serializeCV, hexToCV as stacksHexToCV } from '@stacks/transactions';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';
import React, { useState, useEffect, useRef } from 'react';
import { mocknet, STACKS_API_WS_URL, STACK_API_URL, transactionsApi } from './constants';
import { Storage } from '@stacks/storage';

export function resultToStatus(result) {
  if (result && !result.error && result.startsWith('"') && result.length === 66) {
    const txId = result.substr(1, 64);
    return txIdToStatus(txId);
  } else if (result && result.error) {
    return JSON.stringify(result);
  } else {
    return result.toString();
  }
}

export function txIdToStatus(txId) {
  return (
    <>
      Check transaction status: <a href={txUrl(txId)}>{txId}</a>
    </>
  );
}

export function cvToHex(value) {
  return `0x${serializeCV(value).toString('hex')}`;
}

export function hexToCV(hexString) {
  return stacksHexToCV(hexString);
}

export function txUrl(txId) {
  if (mocknet) {
    return `${STACK_API_URL}/extended/v1/tx/0x${txId}`;
  } else {
    return `https://explorer.stacks.co/txid/0x${txId}?chain=testnet`;
  }
}

const indexFileName = 'index.json';

export async function saveTxData(data, userSession) {
  console.log(JSON.stringify(data));
  const storage = new Storage({ userSession });
  let indexArray;
  try {
    const indexFile = await storage.getFile(indexFileName);
    indexArray = JSON.parse(indexFile);
  } catch (e) {
    console.log(e);
    indexArray = [];
  }
  indexArray.push(data.txId);
  await storage.putFile(indexFileName, JSON.stringify(indexArray));
  await storage.putFile(`txs/${data.txId}.json`, JSON.stringify({ data }));
}

export async function getTxs(userSession) {
  const storage = new Storage({ userSession });
  let indexArray;
  try {
    const indexFile = await storage.getFile(indexFileName);
    indexArray = JSON.parse(indexFile);
    return Promise.all(
      indexArray.map(async txId => {
        const txFile = await storage.getFile(`txs/${txId}.json`);
        const tx = JSON.parse(txFile);
        console.log({tx})
        if (!tx.status) {
          const status = await transactionsApi.getTransactionById({ txId });
          tx.status = status;
          await storage.putFile(`txs/${txId}.json`, JSON.stringify(tx));
        }
        return tx;
      })
    );
  } catch (e) {
    console.log(e);
    return [];
  }
}

export function TxStatus({ txId, resultPrefix }) {
  const [processingResult, setProcessingResult] = useState({ loading: false });
  const spinner = useRef();

  useEffect(() => {
    if (!txId) {
      return;
    }
    console.log(txId);
    spinner.current.classList.remove('d-none');
    setProcessingResult({ loading: true });

    let sub;
    const subscribe = async (txId, update) => {
      try {
        const client = await connectWebSocketClient(STACKS_API_WS_URL);
        sub = await client.subscribeTxUpdates(txId, update);
        console.log({ client, sub });
      } catch (e) {
        console.log(e);
      }
    };

    subscribe(txId, async event => {
      console.log(event);
      let result;
      if (event.tx_status === 'pending') {
        return;
      } else if (event.tx_status === 'success') {
        const tx = await transactionsApi.getTransactionById({ txId });
        console.log(tx);
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

  const normalizedTxId = txId.startsWith('0x') ? txId : `0x${txId}`;
  return (
    <>
      {processingResult.loading && (
        <>
          Checking transaction status:{' '}
          <a href={`https://explorer.stacks.co/txid/${normalizedTxId}?chain=testnet`}>
            {normalizedTxId}
          </a>
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
