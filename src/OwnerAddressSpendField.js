import React, { useRef, useState, useEffect } from 'react';
import { useBlockstack } from 'react-blockstack';
import { privateKeyToString, addressToString } from '@blockstack/stacks-transactions';

import { getStacksAccount, fetchAccount, resultToStatus } from './StacksAccount';
import { getUserAddress } from './StacksAccount';
import { useConnect } from '@blockstack/connect/dist/connect.cjs.production.min';
const BigNum = require('bn.js');

const authOrigin = 'https://deploy-preview-301--stacks-authenticator.netlify.app';

export function OwnerAddressSpendField({ title, path, placeholder }) {
  const { userSession } = useBlockstack();
  const { doSTXTransfer } = useConnect();
  const textfield = useRef();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [account, setAccount] = useState();
  const [identity, setIdentity] = useState();

  useEffect(() => {
    const userData = userSession.loadUserData();
    const appPrivateKey = userData.appPrivateKey;
    const id = getStacksAccount(appPrivateKey);
    setIdentity(id);
    fetchAccount(addressToString(id.address))
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
          setStatus(
            'Warning: Your STX was not published. Try re-signin or contact your "Secret Key" provider!'
          );
        }
      });
  }, [userSession]);

  const sendAction = async () => {
    spinner.current.classList.remove('d-none');

    var username = textfield.current.value.trim();
    var usernameString = username;
    if (username.indexOf('.') < 0) {
      usernameString = `${username} (${username}.id.blockstack)`;
      username = `${username}.id.blockstack`;
    }

    // check recipient
    const recipient = await getUserAddress(userSession, username);
    if (!recipient) {
      setStatus(`Recipient ${usernameString} has not yet used the app`);
      spinner.current.classList.add('d-none');
      return;
    }

    // check balance
    const acc = await fetchAccount(addressToString(identity.address));
    const balance = acc ? parseInt(acc.balance, 16) : 0;
    if (balance < 1000) {
      setStatus('Your balance is below 1000 uSTX');
      spinner.current.classList.add('d-none');
      return;
    }

    console.log('STX address of recipient ' + recipient.address);
    try {
      setStatus(`Sending transaction`);

      await doSTXTransfer({
        recipient: recipient.address,
        amount: new BigNum(1000),
        senderKey: privateKeyToString(identity.privateKey),
        authOrigin,
        appDetails: {
          name: 'Speed Spend',
          icon: 'https://speed-spend.netlify.app/speedspend.png',
        },
        finished: data => {
          console.log(data);
          setStatus(resultToStatus(data));
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
      Send Test STXs
      <div className="NoteField input-group ">
        <div className="input-group-prepend">
          <span className="input-group-text">{title}</span>
        </div>
        <input
          type="text"
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
            Send
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
