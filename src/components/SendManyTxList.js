import { cvToString } from '@stacks/transactions';
import React, { useRef, useState, useEffect } from 'react';

import { getTxs } from '../lib/transactions';
import BigNum from 'bn.js';

export function SendManyTxList({ ownerStxAddress, userSession }) {
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txs, setTxs] = useState();

  useEffect(() => {
    getTxs(userSession)
      .then(async transactions => {
        setStatus(undefined);
        console.log(transactions);
        setTxs(transactions);
      })
      .catch(e => {
        setStatus('Failed to get transactions', e);
        console.log(e);
      });
  }, [userSession]);

  return (
    <div>
      <h5>Recent Send Many transactions</h5>
      <div
        ref={spinner}
        role="status"
        className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
      />
      {txs &&
        txs.map((tx, key) => {
          return (
            <>
              <div key={key}>
                {JSON.parse(tx).stacksTransaction.payload.functionArgs[0].list.map(p => {
                  console.log(p.data.ustx.value);
                  return (
                    <>
                      <div>
                        {cvToString(p.data.to)}:{' '}
                        {(new BigNum(p.data.ustx.value, 'hex') / 1000000).toFixed(6)} STX
                      </div>{' '}
                      <br />
                    </>
                  );
                })}
              </div>
            </>
          );
        })}
      {!txs && <>No transactions yet.</>}
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
