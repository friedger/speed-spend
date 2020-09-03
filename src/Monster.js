import React, { useRef, useState } from 'react';

import { txIdToStatus, CONTRACT_ADDRESS } from './StacksAccount';
import { useConnect } from '@blockstack/connect';
import { PostConditionMode, deserializeCV } from '@blockstack/stacks-transactions';

export function Monster({ monsterId }) {
  const { doContractCall } = useConnect();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const monsterIdNumber = parseInt(
    deserializeCV(new Buffer(monsterId.substr(2), 'hex')).value.toString()
  );

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
      Monster {monsterIdNumber}
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
