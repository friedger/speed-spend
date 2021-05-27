import React, { useEffect, useState } from 'react';
import { cvToString, hexToCV } from '@stacks/transactions';
import { concatTransaction, getPrice, getTxId, getValueForPool } from '../lib/btcTransactions';
import { Amount } from './Amount';
export function BtcTx({ tx }) {
  const [valueForPool, setValueForPool] = useState();
  const [oraclePrice, setOraclePrice] = useState();
  const [blockHeight, setBlockHeight] = useState();
  const [txId, setTxId] = useState();
  useEffect(() => {
    const height = hexToCV(tx.contract_call.function_args[0].hex).data.height.value.toString(10);
    const txPartsCV = hexToCV(tx.contract_call.function_args[1].hex);

    setBlockHeight(height);

    getValueForPool(txPartsCV).then(poolValue => {
      setValueForPool(poolValue.value.value.data.value.value.toNumber());
    });
    getPrice(height).then(price => {
      setOraclePrice(price.value.toNumber());
    });
    concatTransaction(txPartsCV).then(txBuff => {
      getTxId(txBuff).then(txId => setTxId(cvToString(txId)));
    });
  }, [tx]);
  return (
    <div className="p-2 card list-item">
      {txId && (
        <a href={`https://live.blockcypher.com/btc-testnet/tx/${txId.substr(2)}/`}>{txId}</a>
      )}
      {!txId && (
        <div
          role="status"
          className="spinner-border spinner-border-sm text-info align-text-top mr-2"
        />
      )}
      <ul>
        <li>
          Stacks Block:{' '}
          <a
            href={`https://stacks-node-api.testnet.stacks.co/extended/v1/block/by_height/${blockHeight}`}
          >
            {blockHeight}
          </a>
        </li>
        {valueForPool && (
          <li>
            Value for{' '}
            <a href="https://live.blockcypher.com/btc-testnet/address/myfTfju9XSMRusaY2qTitSEMSchsWRA441/">
              Friedger Pool:
            </a>{' '}
            {valueForPool.toLocaleString(undefined, {
              style: 'decimal',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}{' '}
            sats
          </li>
        )}
        {oraclePrice && valueForPool && (
          <li>
            Value based on Oracle's price: <Amount ustx={valueForPool * oraclePrice} />
          </li>
        )}
      </ul>
    </div>
  );
}
