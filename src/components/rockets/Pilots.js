import React, { useRef, useState, useEffect } from 'react';

import { fetchAccount } from '../../lib/account';
import { fetchPilots } from '../../lib/rockets';
import { TxStatus } from '../../lib/transactions';
import { FlyButton } from './FlyButton';

export function Pilots({ ownerStxAddress, rocketId , rocketOwner}) {
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [pilots, setPilots] = useState();
  const [txId, setTxId] = useState();
  useEffect(() => {
    if (ownerStxAddress) {
      fetchAccount(ownerStxAddress)
        .catch(e => {
          setStatus('Failed to access your account', e);
          console.log(e);
        })
        .then(async acc => {
          setStatus(undefined);
          console.log({ acc });
        });
      fetchPilots(rocketId)
        .then(async pilots => {
          console.log({ pilots });
          setStatus(undefined);
          if (pilots.length > 0) {
            setPilots(pilots);
          }
        })
        .catch(e => {
          setStatus('Failed to get rockets of your account', e);
          console.log(e);
        });
    }
  }, [ownerStxAddress, rocketId]);

  const canFly = ownerStxAddress === rocketOwner || (pilots && pilots.indexOf(ownerStxAddress) > 0);
  return (
    <div>
      Authorized Pilots:
      <br/>
      <div
        ref={spinner}
        role="status"
        className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
      />
      {pilots &&
        pilots.map((pilot, key) => {
          return <div key={key}>{pilot}</div>;
        })}
      {!pilots && <>Only the owner can fly this ship.</>}
      {canFly && (
        <FlyButton spinner={spinner} rocketId={rocketId} setStatus={setStatus} setTxId={setTxId} />
      )}
      <br />
      <TxStatus txId={txId} resultPrefix="Flight confirmed in block:" />
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
