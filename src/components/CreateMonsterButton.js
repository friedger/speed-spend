import React, { useRef, useState, useEffect } from 'react';

import { fetchAccount } from '../lib/account';
import { useConnect } from '@stacks/connect-react';
import { PostConditionMode, uintCV, stringAsciiCV } from '@stacks/transactions';
import { CONTRACT_ADDRESS, NETWORK } from '../lib/constants';
import { TxStatus } from '../lib/transactions';

export function CreateMonsterButton({ ownerStxAddress }) {
  const { doContractCall } = useConnect();
  const textfield = useRef();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();

  useEffect(() => {
    if (ownerStxAddress) {
      fetchAccount(ownerStxAddress)
        .catch(e => {
          setStatus('Failed to access your account', e);
          console.log(e);
        })
        .then(async acc => {
          console.log({ acc });
        });
    }
  }, [ownerStxAddress]);

  const sendAction = async () => {
    spinner.current.classList.remove('d-none');

    var name = textfield.current.value.trim();

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'monsters',
        functionName: 'create-monster',
        functionArgs: [stringAsciiCV(name), uintCV(Math.floor(Math.random() * 109))],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        network: NETWORK,
        onFinish: data => {
          console.log(data);
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
      <h5>Create your own monster</h5>
      <div className="NoteField input-group ">
        <input
          type="text"
          ref={textfield}
          className="form-control"
          defaultValue={''}
          placeholder="Name of monster (20 letters max)"
          onKeyUp={e => {
            if (e.key === 'Enter') sendAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={sendAction}>
            <div
              ref={spinner}
              role="status"
              className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
            />
            Create
          </button>
        </div>
      </div>
      <div>
        <TxStatus txId={txId} resultPrefix="Monster was born with id " />
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
