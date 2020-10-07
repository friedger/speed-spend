import React, { useRef, useState, useEffect } from 'react';

import { fetchAccount } from '../lib/account';
import { useConnect } from '@blockstack/connect';
import { TxStatus } from '../lib/transactions';
const BigNum = require('bn.js');

export function HodlButton({ title, path, placeholder, ownerStxAddress, appStxAddress }) {
  const { doSTXTransfer } = useConnect();
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

  const sendAction = async () => {
    spinner.current.classList.remove('d-none');

    var amountAsString = textfield.current.value.trim();
    var amount = parseInt(amountAsString);

    // check balance
    const acc = await fetchAccount(ownerStxAddress);
    const balance = acc ? parseInt(acc.balance, 16) : 0;
    if (balance < amount) {
      setStatus(`Your balance is below ${amount} uSTX`);
      spinner.current.classList.add('d-none');
      return;
    }

    try {
      setStatus(`Sending transaction`);

      await doSTXTransfer({
        recipient: appStxAddress,
        amount: new BigNum(amount),
        appDetails: {
          name: 'Speed Spend',
          icon: 'https://speed-spend.netlify.app/speedspend.png',
        },
        finished: data => {
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
      Hodl (from your own address to your app hodl address)
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
            Hodl
          </button>
        </div>
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
      <div>
        <TxStatus txId={txId} resultPrefix="Hodl tokens sent: " />
      </div>
    </div>
  );
}
