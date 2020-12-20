import React, { useRef, useState, useEffect } from 'react';

import { fetchAccount } from '../lib/account';

import { deserializeCV } from '@stacks/transactions';
import { Rocket } from './Rocket';
import { fetchNFTIds } from '../lib/nft';

export function MyRockets({ ownerStxAddress }) {
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [rockets, setRockets] = useState();

  useEffect(() => {
    fetchAccount(ownerStxAddress)
      .catch(e => {
        setStatus('Failed to access your account', e);
        console.log(e);
      })
      .then(async acc => {
        console.log({ acc });
      });
    fetchNFTIds(ownerStxAddress)
      .then(async rocketIds => {
        console.log(rocketIds);
        setRockets(rocketIds);
      })
      .catch(e => {
        setStatus('Failed to get rockets of your account', e);
        console.log(e);
      });
  }, [ownerStxAddress]);

  return (
    <div>
      <h5>My current and previous rocket ships</h5>
      <div
        ref={spinner}
        role="status"
        className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
      />
      {rockets &&
        rockets.map((rocketIdHex, key) => {
          const rocketId = deserializeCV(Buffer.from(rocketIdHex.substr(2), 'hex'));
          return <Rocket key={key} rocketId={rocketId.value} ownerStxAddress={ownerStxAddress} />;
        })}
      {!rockets && <>No rocket ships yet. Create one!</>}
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
