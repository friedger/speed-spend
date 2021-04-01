import React, { useRef, useState, useEffect } from 'react';

import {
  CONTRACT_ADDRESS,
  NETWORK,
  ROCKET_FACTORY_CONTRACT_NAME,
  ROCKET_MARKET_CONTRACT_NAME,
} from '../../lib/constants';
import { TxStatus } from '../../lib/transactions';
import { fetchAccount } from '../../lib/account';
import { useConnect } from '@stacks/connect-react';
import { PostConditionMode, standardPrincipalCV, uintCV } from '@stacks/transactions';

export function AuthorizePilotButton({ ownerStxAddress, rocketId }) {
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
          setStatus(undefined);
          console.log({ acc });
        });
    }
  }, [ownerStxAddress]);

  const authAction = async () => {
    spinner.current.classList.remove('d-none');

    var pilot = textfield.current.value.trim();

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: ROCKET_MARKET_CONTRACT_NAME,
        functionName: 'authorize-pilot',
        functionArgs: [uintCV(rocketId), standardPrincipalCV(pilot)],
        postConditionMode: PostConditionMode.Deny,
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
      <div className="NoteField input-group ">
        <input
          type="text"
          ref={textfield}
          className="form-control"
          placeholder="Pilot's address"
          onKeyUp={e => {
            if (e.key === 'Enter') authAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={authAction}>
            <div
              ref={spinner}
              role="status"
              className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
            />
            Authorize Pilot to fly
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
