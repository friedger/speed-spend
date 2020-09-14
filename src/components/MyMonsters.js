import React, { useRef, useState, useEffect } from 'react';

import { CONTRACT_ADDRESS, fetchAccount } from '../StacksAccount';
import { AccountsApi } from '@stacks/blockchain-api-client';
import { Monster } from './Monster';
import { deserializeCV } from '@blockstack/stacks-transactions';

const accountsApi = new AccountsApi();

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
    accountsApi
      .getAccountAssets({ principal: ownerStxAddress })
      .catch(e => {
        setStatus('Failed to get balances of your account', e);
        console.log(e);
      })
      .then(b =>
        b.results
          .filter(
            a =>
              a.event_type === 'non_fungible_token_asset' &&
              a.asset.asset_id === `${CONTRACT_ADDRESS}.monsters::nft-monsters`
          )
          .map(a => a.asset.value.hex)
      )
      .then(async monsterIds => {
        console.log(monsterIds);
        setMonsters(monsterIds);
      });
  }, [ownerStxAddress]);

  return (
    <div>
      <h5>My Monsters</h5>
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
