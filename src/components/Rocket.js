import React, { useRef, useState, useEffect } from 'react';

import { CONTRACT_ADDRESS, NETWORK } from '../lib/constants';
import { cvToHex, TxStatus } from '../lib/transactions';
import { useConnect } from '../lib/auth';
import { PostConditionMode, uintCV } from '@stacks/transactions';
import { fetchMonsterDetails } from '../lib/monsters';
import { BuyRocket } from './BuyRocket';

export function Rocket({ rocketId, ownerStxAddress }) {
  const { doContractCall } = useConnect();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [rocketDetails, setRocketDetails] = useState();

  const monsterIdNumber = parseInt(rocketId);

  useEffect(() => {
    if (rocketId) {
      fetchMonsterDetails(rocketId)
        .then(details => {
          console.log({ details });
          setRocketDetails(details);
        })
        .catch(e => console.log(e));
    } else {
      console.log('no rocketId');
    }
  }, [rocketId]);

  const flyAction = async () => {
    spinner.current.classList.remove('d-none');

    try {
      setStatus(`Sending transaction`);
      console.log({ rocketId });
      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'rocket-market',
        functionName: 'fly-ship',
        functionArgs: [cvToHex(uintCV(rocketId))],
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
      {rocketDetails ? (
        <>
          <img
            src={`/rockets/ship-${rocketDetails.metaData.size % 5}.png`}
            alt="monster"
            width="100"
          />
          <br />
          Size {rocketDetails.metaData.size}
          <br />
          {rocketDetails.owner !== ownerStxAddress && (
            <>
              <br />
              <small>Owned by: {rocketDetails.owner}</small>
            </>
          )}
          <br />
          <small>ID: {monsterIdNumber}</small>
          {rocketDetails.claimed && (
            <>
              <br />
              <div className="input-group ">
                <button className="btn btn-outline-secondary" type="button" onClick={flyAction}>
                  <div
                    ref={spinner}
                    role="status"
                    className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
                  />
                  Fly
                </button>
              </div>
            </>
          )}
          <BuyRocket ownerStxAddress={ownerStxAddress} rocketId={rocketId} />
          <br />
          <TxStatus txId={txId} resultPrefix="Flight confirmed in block:" />
        </>
      ) : (
        <>
          <br />
          This rocket has not yet been ordered.
          <br />
          <br />
          <BuyRocket ownerStxAddress={ownerStxAddress} />
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
