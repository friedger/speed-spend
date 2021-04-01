import React, { useRef, useState, useEffect } from 'react';

import { CONTRACT_ADDRESS, NETWORK } from '../lib/constants';
import { cvToHex, TxStatus } from '../lib/transactions';
import { useConnect } from '@stacks/connect-react';
import { PostConditionMode, uintCV } from '@stacks/transactions';
import { fetchMonsterDetails } from '../lib/monsters';
import { CreateMonsterButton } from './CreateMonsterButton';
import { BuyMonsters } from './BuyMonsters';

export function Monster({ monsterId, ownerStxAddress }) {
  const { doContractCall } = useConnect();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [monsterDetails, setMonsterDetails] = useState();

  const monsterIdNumber = parseInt(monsterId);

  useEffect(() => {
    if (monsterId) {
      fetchMonsterDetails(monsterId)
        .then(details => {
          console.log({ details });
          setMonsterDetails(details);
        })
        .catch(e => console.log(e));
    } else {
      console.log('no monsterId');
    }
  }, [monsterId]);

  const feedAction = async () => {
    spinner.current.classList.remove('d-none');

    try {
      setStatus(`Sending transaction`);
      console.log({ monsterId });
      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'monsters',
        functionName: 'feed-monster',
        functionArgs: [uintCV(monsterId)],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        network: NETWORK,
        finished: data => {
          console.log(data);
          setStatus(undefined);
          setTxId(data.txId);
          spinner.current.classList.add('d-none');
        },
      });
    } catch (e) {
      console.log(e);
      setStatus(e.toString());
      spinner.current.classList.add('d-none');
    }
  };

  return (
    <div>
      {monsterDetails ? (
        <>
          <img
            src={`/monsters/monster-${(monsterDetails.metaData.image - 1) % 109}.png`}
            alt="monster"
            width="100"
            className={monsterDetails.owner !== ownerStxAddress ? 'monster' : 'own-monster'}
          />
          <br />

          <b>{monsterDetails.metaData.name}</b>
          <br />
          <small>
            Last fed at: {new Date(monsterDetails.metaData.lastMeal * 1000).toUTCString()}
          </small>
          <br />
          <small>Still alive: {monsterDetails.alive.toString()}</small>
          {monsterDetails.owner !== ownerStxAddress && (
            <>
              <br />
              <small>Owned by: {monsterDetails.owner}</small>
            </>
          )}
          <br />
          <small>ID: {monsterIdNumber}</small>
          {monsterDetails.alive && (
            <>
              <br />
              <div className="input-group ">
                <button className="btn btn-outline-secondary" type="button" onClick={feedAction}>
                  <div
                    ref={spinner}
                    role="status"
                    className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
                  />
                  Feed
                </button>
              </div>
            </>
          )}
          <BuyMonsters ownerStxAddress={ownerStxAddress} monsterId={monsterId} />
          <br />
          <TxStatus txId={txId} resultPrefix="Meal confirmed in block:" />
        </>
      ) : (
        <>
          <br />
          This monster is not yet born.
          <br />
          <br />
          <CreateMonsterButton ownerStxAddress={ownerStxAddress} />
        </>
      )}

      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
