import React, { useState, useEffect } from 'react';
import { fetchBtcTxList } from '../lib/btcTransactions';
import { BtcTx } from './BtcTx';

export function BtcTxList({ ownerStxAddress }) {
  const [status, setStatus] = useState();
  const [loading, setLoading] = useState(false);
  const [txs, setTxs] = useState();

  useEffect(() => {
    setLoading(true);
    fetchBtcTxList()
      .then(tx => {
        setStatus(undefined);
        setTxs(tx);
        setLoading(false);
      })
      .catch(e => {
        setStatus('Failed to get txs', e);
        console.log(e);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <h5>All Reported Bitcoin Transactions</h5>
      <div
        role="status"
        className={`${
          loading ? '' : 'd-none'
        } spinner-border spinner-border-sm text-info align-text-top mr-2`}
      />
      {txs &&
        txs.map((tx, key) => {
          return <BtcTx key={key} tx={tx} />;
        })}
      {!txs && <>No transactions yet reported. Report one!</>}
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
