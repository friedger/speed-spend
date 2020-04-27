import React, { useRef } from 'react';
import { useFile, useBlockstack } from 'react-blockstack';
import Profile from './Profile';
import {
  makeSTXTokenTransfer,
  TransactionVersion,
  ChainID,
  FungibleConditionCode,
} from '@blockstack/stacks-transactions';
import { makeStandardSTXPostCondition } from '@blockstack/stacks-transactions/lib/src/builders';
const BigNum = require('bn.js');

function NoteField({ title, path, placeholder }) {
  const { userSession } = useBlockstack();
  const [nonce, setNonce] = useFile('nonce.txt');
  const textfield = useRef();
  const nonceField = useRef();
  const spinner = useRef();
  const saveAction = async () => {
    spinner.current.classList.remove('d-none');
    setTimeout(() => spinner.current.classList.add('d-none'), 1500);
    const recipient = await userSession
      .getFile('stx.json', {
        decrypt: false,
        username: textfield.current.value,
      })
      .then(r => JSON.parse(r))
      .catch(e => console.log(e));
    if (!recipient) {
      return;
    }
    const nonceInt = parseInt(nonceField.current.value);

    console.log('STX address of recipient ' + recipient.address);
    try {
      const transaction = makeSTXTokenTransfer(
        'ST1T220B88WSF0ZYNS8V7B33DCZEY23FY7V83GDW',
        new BigNum(1000),
        new BigNum(1000),
        '994d526b3b3409def4d3e481f9c4b3debaf9535cffed0769a7543601e1efa3c501',
        {
          nonce: new BigNum(nonceInt),
          version: TransactionVersion.Testnet,
          chainId: ChainID.Testnet,
          postConditions: [
            makeStandardSTXPostCondition(
              'ST2P4S7Q4PHGQE9VGG6X8Z54MQQMN1E5047ZHVAF7',
              FungibleConditionCode.Less,
              new BigNum(2000)
            ),
          ],
        }
      );
      console.log(transaction.serialize().toString('hex'));
      setNonce(String(nonce + 1));
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div>
      Nonce:
      <input
        type="number"
        ref={nonceField}
        className="form-control"
        defaultValue={'0'}
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
          defaultValue={nonce || ''}
          placeholder={placeholder}
          onKeyUp={e => {
            if (e.key === 'Enter') saveAction();
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
        <div className="mx-auto col col-xs-10 col-md-8 px-4">
          <NoteField
            title="Send 1000 uSTX to"
            path="note"
            placeholder="Username"
          />
        </div>

        <div className="card col col-sm-10 col-md-8 mx-auto mt-5 text-center px-0 border-warning">
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
