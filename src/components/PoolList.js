import React, { useRef, useState, useEffect } from 'react';

import { Pool } from './Pool';
import { fetchPools } from '../lib/pools';

export function PoolList({ ownerStxAddress }) {
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [pools, setPools] = useState();

  useEffect(() => {
    fetchPools()
      .then(async pools => {
        setStatus(undefined);
        console.log(pools);
        setPools(pools);
      })
      .catch(e => {
        setStatus('Failed to get pools', e);
        console.log(e);
      });
  }, []);

  return (
    <div>
      <h5>All Public Pools</h5>
      <div
        ref={spinner}
        role="status"
        className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
      />
      {pools &&
        pools.map((pool, key) => {
          return (
            <Pool key={key} pool={pool} poolId={key + 1} />
          );
        })}
      {!pools && <>No pools yet. Register one!</>}
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
