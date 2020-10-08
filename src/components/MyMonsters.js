import React, { useRef, useState, useEffect } from 'react';

import { fetchAccount } from '../lib/account';

import { Monster } from './Monster';
import { deserializeCV } from '@blockstack/stacks-transactions';
import { fetchMonsterIds } from '../lib/monsters';

export function MyMonsters({ ownerStxAddress }) {
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [monsters, setMonsters] = useState();

  useEffect(() => {
    fetchAccount(ownerStxAddress)
      .catch(e => {
        setStatus('Failed to access your account', e);
        console.log(e);
      })
      .then(async acc => {
        console.log({ acc });
      });
    fetchMonsterIds(ownerStxAddress)
      .then(async monsterIds => {
        console.log(monsterIds);
        setMonsters(monsterIds);
      })
      .catch(e => {
        setStatus('Failed to get balances of your account', e);
        console.log(e);
      });
  }, [ownerStxAddress]);

  return (
    <div>
      <h5>My current and previous Monsters</h5>
      <div
        ref={spinner}
        role="status"
        className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
      />
      {monsters &&
        monsters.map((monsterIdHex, key) => {
          const monsterId = deserializeCV(Buffer.from(monsterIdHex.substr(2), 'hex'));
          return (
            <Monster key={key} monsterId={monsterId.value} ownerStxAddress={ownerStxAddress} />
          );
        })}
      {!monsters && <>No monsters yet. Create one!</>}
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
