import React, { useRef, useState, useEffect } from 'react';
import { useBlockstack } from 'react-blockstack';
import {
  makeSTXTokenTransfer,
  privateKeyToString,
  addressToString,
  broadcastTransaction,
} from '@stacks/transactions';

import { NETWORK } from '../lib/constants';
import { getUserAddress, getStacksAccount, fetchAccount } from '../lib/account';
import { putStxAddress } from '../UserSession';
import { resultToStatus } from '../lib/transactions';
const BigNum = require('bn.js');

export function UnHodlButton({ title, placeholder, ownerStxAddress }) {
  const { userSession } = useBlockstack();
  const textfield = useRef();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [account, setAccount] = useState();
  const [identity, setIdentity] = useState();

  useEffect(() => {
    const userData = userSession.loadUserData();
    const appPrivateKey = userData.appPrivateKey;
    const id = getStacksAccount(appPrivateKey);
    const addrAsString = addressToString(id.address);
    setIdentity(id);
    fetchAccount(addrAsString)
      .catch(e => {
        setStatus('Failed to access your account', e);
        console.log(e);
      })
      .then(async acc => {
        setAccount(acc);
        console.log({ acc });
        const address = await getUserAddress(userSession, userData.username);
        console.log(address);

        if (!address) {
          await putStxAddress(userSession, addrAsString);
        }
      });
  }, [userSession]);

  const sendAction = async () => {
    spinner.current.classList.remove('d-none');

    var amountString = textfield.current.value.trim();
    const amount = parseInt(amountString);

    // check balance
    const acc = await fetchAccount(addressToString(identity.address));
    const balance = acc ? parseInt(acc.balance, 16) : 0;
    if (balance < amount) {
      setStatus(`Your balance is below ${amount} uSTX`);
      spinner.current.classList.add('d-none');
      return;
    }

    try {
      const transaction = await makeSTXTokenTransfer({
        recipient: ownerStxAddress,
        amount: new BigNum(amount),
        senderKey: privateKeyToString(identity.privateKey),
        network: NETWORK,
      });
      setStatus(`Sending transaction`);

      const result = await broadcastTransaction(transaction, NETWORK);
      console.log(result);
      spinner.current.classList.add('d-none');
      setStatus(resultToStatus(result));
    } catch (e) {
      console.log(e);
      spinner.current.classList.add('d-none');
      setStatus(e.toString());
    }
  };

  return (
    <div>
      Unhodl (from your app hodl address to your own address)
      <div className="NoteField input-group ">
        <input
          type="decimal"
          ref={textfield}
          className="form-control"
          defaultValue={''}
          placeholder={placeholder}
          disabled={!account}
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
            UnHold
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
