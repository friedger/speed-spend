import React, { useRef, useState, useEffect } from 'react';
import { useFile, useBlockstack } from 'react-blockstack';
import Profile from './Profile';
import {
  makeSTXTokenTransfer,
  TransactionVersion,
  ChainID,
  privateKeyToString,
  addressToString,
} from '@blockstack/stacks-transactions';
import { getStacksAccount } from './StacksAccount';
const BigNum = require('bn.js');

const STACK_API_URL = ' https://crashy-stacky.zone117x.com/v2/transactions';
const STACKS_API_ACCOUNTS_URL = ' https://crashy-stacky.zone117x.com/v2/accounts';

async function getUserAddress(userSession, username) {
  return userSession
    .getFile('stx.json', {
      decrypt: false,
      username: username,
    })
    .then(r => JSON.parse(r))
    .catch(e => console.log(e));
}

function NoteField({ title, path, placeholder }) {
  const { userSession } = useBlockstack();
  const [nonce, setNonce] = useFile('nonce.txt');
  const textfield = useRef();
  const nonceField = useRef();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [account, setAccount] = useState();
  const [privateKey, setPrivateKey] = useState();

  useEffect(() => {
    const appPrivateKey = userSession.loadUserData().appPrivateKey;
    const { address, privateKey } = getStacksAccount(appPrivateKey);
    setPrivateKey(privateKey);
    fetch(`${STACKS_API_ACCOUNTS_URL}/${addressToString(address)}`)
      .then(r => r.json())
      .catch(e => {
        setStatus('Failed to access your account', e);
        console.log(e);
      })
      .then(acc => setAccount(acc));
  }, [userSession]);

  const saveAction = async () => {
    spinner.current.classList.remove('d-none');

    // check recipient
    const recipient = await getUserAddress(
      userSession,
      textfield.current.value
    );
    if (!recipient) {
      setStatus(
        `Recipient ${textfield.current.value} has not yet used the app`
      );
      spinner.current.classList.add('d-none');
      return;
    }

    // check nonce and balance
    console.log({ account });
    const nonceInt = account
      ? account.nonce
      : parseInt(nonceField.current.value);
    const balance = account ? parseInt(account.balance, 16) : 0;
    if (balance < 1000) {
      setStatus('Your balance is below 1000 uSTX');
      spinner.current.classList.add('d-none');
      return;
    }

    console.log('STX address of recipient ' + recipient.address);
    try {
      const transaction = makeSTXTokenTransfer(
        recipient.address,
        new BigNum(1000),
        new BigNum(1000),
        privateKeyToString(privateKey),
        {
          nonce: new BigNum(nonceInt),
          version: TransactionVersion.Testnet,
          chainId: ChainID.Testnet,
        }
      );
      setStatus(`Sending transaction using nonce ${nonceInt}`);
      console.log(await transaction.broadcast(STACK_API_URL));
      setNonce(String(nonceInt + 1));
      spinner.current.classList.add('d-none');
      setStatus(undefined);
    } catch (e) {
      console.log(e);
      setStatus(e.toString());
      spinner.current.classList.add('d-none');
    }
  };

  return (
    <div>
      Nonce:
      <input
        type="number"
        ref={nonceField}
        className="form-control"
        defaultValue={nonce || '0'}
      />
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
            if (e.key === 'Enter') saveAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <div className="input-group-append">
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={saveAction}
          >
            <div
              ref={spinner}
              role="status"
              className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
            />
            Send
          </button>
        </div>
        {status && <div color="red">{status}</div>}
      </div>
    </div>
  );
}

export default function Main(props) {
  return (
    <main className="panel-welcome mt-5 container">
      <div className="row">
        <div className="mx-auto col-sm-10 col-md-8 px-4">
          <Profile />
        </div>
      </div>
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <NoteField
            title="Send 1000 uSTX to"
            path="note"
            placeholder="Username"
          />
        </div>

        <div className="card col-md-8 mx-auto mt-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">
              Copy STX address and visit faucet to get 10k uSTX (testnet
              tokens).
            </li>
            <li className="list-group-item">
              Enter the blockstack id of a friend (that signed in to this app
              already)
            </li>
            <li className="list-group-item">
              Press the <i>Enter</i> key or click the <i>Send</i> button to send
              off the tokens.
            </li>
            <li className="list-group-item">
              Check the balance again (after a few seconds) to see whether
              tokens were send.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
