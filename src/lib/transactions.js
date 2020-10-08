import { deserializeCV, serializeCV } from '@blockstack/stacks-transactions';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';
import React, { useState, useEffect, useRef } from 'react';
import { mocknet, STACKS_API_WS_URL, STACK_API_URL, transactionsApi } from './constants';

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
  const hexStringNoPrefix = hexString.startsWith('0x') ? hexString.substr(2) : hexString;
  return deserializeCV(Buffer.from(hexStringNoPrefix, 'hex'));
}

export function txUrl(txId) {
  if (mocknet) {
    return `${STACK_API_URL}/extended/v1/tx/0x${txId}`;
  } else {
    return `https://testnet-explorer.blockstack.org/txid/0x${txId}`;
  }
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
      const client = await connectWebSocketClient(STACKS_API_WS_URL);
      sub = await client.subscribeTxUpdates(txId, update);
      console.log({ client, sub });
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
