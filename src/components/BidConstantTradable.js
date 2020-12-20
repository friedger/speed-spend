import React, { useRef, useState, useEffect } from 'react';

import { CONTRACT_ADDRESS, NETWORK } from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect } from '@stacks/connect-react';
import { contractPrincipalCV, PostConditionMode, uintCV } from '@stacks/transactions';

export function BidConstantTradable({ ownerStxAddress, tradableId }) {
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

    var tradableId = textfield.current.value.trim();

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'market',
        functionName: 'bid',
        functionArgs: [
          contractPrincipalCV(CONTRACT_ADDRESS, 'constant-tradables'),
          uintCV(parseInt(tradableId)),
          uintCV(1000),
        ],
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
      <h5>Bid for a constant tradable for 1000 uSTX</h5>
      <div className="NoteField input-group ">
        <input
          type="text"
          ref={textfield}
          className="form-control"
          defaultValue={tradableId}
          placeholder="Id of tradable"
          hidden={tradableId}
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
