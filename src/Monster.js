import React, { useRef, useState, useEffect } from 'react';

import {
  txIdToStatus,
  CONTRACT_ADDRESS,
  fetchMonsterDetails,
  MONSTERS_CONTRACT_NAME,
} from './StacksAccount';
import { useConnect } from '@blockstack/connect';
import {
  PostConditionMode,
  deserializeCV,
  serializeCV,
  uintCV,
} from '@blockstack/stacks-transactions';

export function Monster({ monsterId }) {
  const { doContractCall } = useConnect();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [monsterDetails, setMonsterDetails] = useState();

  const monsterIdNumber = parseInt(monsterId);

  useEffect(() => {
    if (monsterId) {
      fetchMonsterDetails(monsterId)
        .then(details => {
          setMonsterDetails(details);
        })
        .catch(e => console.log(e));
    } else {
      console.log('no monsterId');
    }
  }, [monsterId]);

  const sendAction = async () => {
    spinner.current.classList.remove('d-none');

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'monsters',
        functionName: 'feed-monster',
        functionArgs: [monsterId.substr(2)],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        appDetails: {
          name: 'Speed Spend',
          icon: 'https://speed-spend.netlify.app/speedspend.png',
        },
        finished: data => {
          console.log(data);
          setStatus(txIdToStatus(data.txId));
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
      <img src={`/monsters/monster-${(monsterIdNumber - 1) % 109}.png`} alt="monster" width="100" />
      <br />
      {monsterDetails && (
        <>
          <b>{monsterDetails.metaData.name}</b>
          <br />
          <small>Last fed: block {monsterDetails.metaData.lastMeal}</small>
          <br />
          <small>Owned by: {monsterDetails.owner}</small>
          <br />
          <small>ID: {monsterIdNumber}</small>
        </>
      )}
      <br />
      <div className="input-group ">
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={sendAction}>
            <div
              ref={spinner}
              role="status"
              className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
            />
            Feed
          </button>
        </div>
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
