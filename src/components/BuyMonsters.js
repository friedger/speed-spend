import React, { useRef, useState, useEffect } from 'react';

import { CONTRACT_ADDRESS } from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect } from '@blockstack/connect';
import { PostConditionMode, uintCV } from '@blockstack/stacks-transactions';

export function BuyMonsters({ ownerStxAddress, monsterId }) {
  const { doContractCall } = useConnect();
  const textfield = useRef();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();

  useEffect(() => {
    fetchAccount(ownerStxAddress)
      .catch(e => {
        setStatus('Failed to access your account', e);
        console.log(e);
      })
      .then(async acc => {
        console.log({ acc });
      });
  }, [ownerStxAddress]);

  const bidAction = async () => {
    spinner.current.classList.remove('d-none');

    var monsterId = textfield.current.value.trim();

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'market',
        functionName: 'bid',
        functionArgs: [uintCV(parseInt(monsterId)), uintCV(1000)],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        appDetails: {
          name: 'Speed Spend',
          icon: 'https://speed-spend.netlify.app/speedspend.png',
        },
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
      <h5>Bid for a monster for 1000 uSTX</h5>
      <div className="NoteField input-group ">
        <input
          type="text"
          ref={textfield}
          className="form-control"
          defaultValue={monsterId}
          placeholder="Id of monster"
          hidden={monsterId}
          onKeyUp={e => {
            if (e.key === 'Enter') bidAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={bidAction}>
            <div
              ref={spinner}
              role="status"
              className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
            />
            Bid
          </button>
        </div>
      </div>
      <div>
        <TxStatus txId={txId} resultPrefix="Offer placed in block " />
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
