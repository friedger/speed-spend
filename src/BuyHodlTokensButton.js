import React, { useRef, useState, useEffect } from 'react';

import { txIdToStatus, CONTRACT_ADDRESS } from './StacksAccount';
import { useConnect } from '@blockstack/connect';
import {
  uintCV,
  PostConditionMode,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
} from '@blockstack/stacks-transactions';
import * as BigNum from 'bn.js';

export function BuyHodlTokensButton({ placeholder, ownerStxAddress }) {
  const { doContractCall } = useConnect();
  const textfield = useRef();
  const spinner = useRef();
  const [status, setStatus] = useState();

  useEffect(() => {
    fetch(ownerStxAddress)
      .catch(e => {
        setStatus('Failed to access your account', e);
        console.log(e);
      })
      .then(async acc => {
        console.log({ acc });
      });
  }, [ownerStxAddress]);

  const sendAction = async () => {
    spinner.current.classList.remove('d-none');

    var amountAsString = textfield.current.value.trim();
    var amount = parseInt(amountAsString);

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'hodl-token',
        functionName: 'buy-tokens',
        functionArgs: [uintCV(amount)],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [
          makeStandardSTXPostCondition(
            ownerStxAddress,
            FungibleConditionCode.LessEqual,
            new BigNum(amount)
          ),
        ],
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
      Buy Hodl tokens (1 STX = 1 Hodl token)
      <div className="NoteField input-group ">
        <input
          type="decimal"
          ref={textfield}
          className="form-control"
          defaultValue={''}
          placeholder={placeholder}
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
            Buy
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
