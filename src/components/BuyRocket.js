import React, { useRef, useState, useEffect } from 'react';

import { CONTRACT_ADDRESS, NETWORK } from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect } from '@stacks/connect-react';
import { PostConditionMode, uintCV } from '@stacks/transactions';

export function BuyRocket({ ownerStxAddress }) {
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
        setStatus(undefined);
        console.log({ acc });
      });
  }, [ownerStxAddress]);

  const orderAction = async () => {
    spinner.current.classList.remove('d-none');

    var size = textfield.current.value.trim();

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'rockets',
        functionName: 'order',
        functionArgs: [uintCV(parseInt(size))],
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
      <h5>Order a rocket</h5>
      <div className="NoteField input-group ">
        <input
          type="text"
          ref={textfield}
          className="form-control"
          defaultValue={2}
          placeholder="Rocket size"
          onKeyUp={e => {
            if (e.key === 'Enter') orderAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={orderAction}>
            <div
              ref={spinner}
              role="status"
              className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
            />
            Order
          </button>
        </div>
      </div>
      <div>
        <TxStatus txId={txId} resultPrefix="Order placed in block " />
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
