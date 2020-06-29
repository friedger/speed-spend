import React, { useRef, useState, useEffect } from 'react';
import { useBlockstack } from 'react-blockstack';
import Profile from './Profile';
import {
  makeSTXTokenTransfer,
  makeContractCall,
  privateKeyToString,
  addressToString,
  trueCV,
  falseCV,
  StacksTestnet,
  broadcastTransaction,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  makeContractSTXPostCondition,
  deserializeCV,
} from '@blockstack/stacks-transactions';
import Switch from 'react-input-switch';

import { getStacksAccount, STACK_API_URL, fetchAccount } from './StacksAccount';
import { getUserAddress } from './StacksAccount';
const BigNum = require('bn.js');

const network = new StacksTestnet();
network.coreApiUrl = 'https://sidecar.staging.blockstack.xyz';

const contractAddress = 'ST12EY99GS4YKP0CP2CFW6SEPWQ2CGVRWK5GHKDRV';

function BetButton({ jackpot }) {
  const { userSession } = useBlockstack();
  const spinner = useRef();
  const [betValue, setBetValue] = useState(0);
  const [status, setStatus] = useState();
  const [account, setAccount] = useState();
  const [identity, setIdentity] = useState();
  const [jackpotValue, setJackpotValue] = useState();

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
      });
    fetch(
      `${network.coreApiUrl}/v2/contracts/call-read/${contractAddress}/flip-coin-jackpot/get-jackpot`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: `{"sender":"${addressToString(id.address)}","arguments":[]}`,
      }
    )
      .then(response => response.json())
      .then(jackpot => {
        console.log({ jackpot });
        if (jackpot.okay) {
          const cv = deserializeCV(Buffer.from(jackpot.result.substr(2), 'hex'));

          if (cv.value) {
            setJackpotValue(cv.value);
          }
        }
      });
  }, [userSession]);

  const betAction = async () => {
    spinner.current.classList.remove('d-none');

    // check balance
    const acc = await fetchAccount(addressToString(identity.address));
    const balance = acc ? parseInt(acc.balance, 16) : 0;
    if (balance < 1000) {
      setStatus('Your balance is below 1000 uSTX');
      spinner.current.classList.add('d-none');
      return;
    }

    console.log(`Betting on ${betValue} using jackpot ${jackpot}`);

    try {
      const transaction = await makeContractCall({
        contractAddress,
        contractName: jackpot ? 'flip-coin-jackpot' : 'flip-coin-at-two',
        functionName: 'bet',
        functionArgs: [betValue ? trueCV() : falseCV()],
        senderKey: privateKeyToString(identity.privateKey),
        network,
        postConditions: [
          makeStandardSTXPostCondition(
            addressToString(identity.address),
            FungibleConditionCode.LessEqual,
            new BigNum(1000)
          ),
          makeContractSTXPostCondition(
            contractAddress,
            jackpot ? 'flip-coin-jackpot' : 'flip-coin-at-two',
            FungibleConditionCode.GreaterEqual,
            new BigNum(0)
          ),
        ],
      });
      console.log(transaction);
      const result = await broadcastTransaction(transaction, network);
      console.log(result);
      spinner.current.classList.add('d-none');
      if (result.startsWith('"') && result.length === 66) {
        const txid = result.substr(1, 64);
        setStatus(
          <>
            Check transaction status:
            <a href={`https://testnet-explorer.blockstack.org/txid/0x${txid}`}>{txid}</a>
          </>
        );
      } else {
        setStatus(result);
      }
    } catch (e) {
      console.log(e);
      setStatus(e.toString());
      spinner.current.classList.add('d-none');
    }
  };

  return (
    <div>
      Bet 1000mSTX on "HEADS" ("true") or "TAILS" ("false") and{' '}
      {jackpot ? (
        <>get the jackpot {jackpotValue ? <> of {jackpotValue.toString(10)}</> : null}</>
      ) : (
        <>win against somebody else</>
      )}{' '}
      or loose your money.
      <div className="input-group ">
        <div className="input-group-prepend">
          <span className="input-group-text">Your bet is {betValue ? '"HEADS"' : '"TAILS"'}</span>
        </div>
        <div className="mx-auto">
          <Switch
            styles={{
              track: {
                backgroundColor: 'yellow',
                borderRadius: 14,
              },
              trackChecked: {
                backgroundColor: 'blue',
              },
              button: {
                backgroundColor: 'blue',
                borderRadius: 18,
              },
              buttonChecked: {
                backgroundColor: 'yellow',
              },
              container: {
                position: 'relative',
                display: 'inline-block',
                width: 40,
                height: 28,
                verticalAlign: 'middle',
                cursor: 'pointer',
                userSelect: 'none',
              },
            }}
            theme={{ primaryColor: 'blue', secondaryColor: 'green' }}
            value={betValue}
            disabled={!account}
            onKeyUp={e => {
              if (e.key === 'Enter') betAction();
            }}
            onBlur={e => {
              setStatus(undefined);
            }}
            onChange={value => {
              console.log(value);
              setBetValue(value);
            }}
          />
        </div>

        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={betAction}>
            <div
              ref={spinner}
              role="status"
              className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
            />
            {jackpot ? <>Bet Now</> : <>Bet against somebody</>}
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

function SpendField({ title, path, placeholder }) {
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

  const saveAction = async () => {
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
      const transaction = makeSTXTokenTransfer({
        recipient: recipient.address,
        amount: new BigNum(1000),
        senderKey: privateKeyToString(identity.privateKey),
        network: network,
      });
      setStatus(`Sending transaction`);

      const result = await broadcastTransaction(transaction, network);
      console.log(result);
      spinner.current.classList.add('d-none');
      setStatus(result);
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
            if (e.key === 'Enter') saveAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={saveAction}>
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
          <SpendField title="Send 1000 uSTX to" path="note" placeholder="Username" />
        </div>

        <div className="card col-md-8 mx-auto mt-5 mb-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">Claim test tokens from the faucet to get 500k uSTX.</li>
            <li className="list-group-item">Wait a few minutes and refresh the account balance.</li>
            <li className="list-group-item">
              Enter the blockstack username of a friend (that signed in to this app already).
              Examples are
              <br />
              <em>openintents</em> <br />
              (which is the same as <em>openintents.id.blockstack</em>) <br />
              or
              <br /> <em>friedger.id</em>
            </li>
            <li className="list-group-item">
              Press the <i>Enter</i> key or click the <i>Send</i> button to send off the tokens.
            </li>
            <li className="list-group-item">
              Check the balance again (after a few seconds) to see whether tokens were sent.
            </li>
          </ul>
        </div>

        <div className="col-xs-10 col-md-8 mx-auto  px-4">
          <hr />
        </div>

        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <BetButton jackpot={true} />
        </div>

        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <BetButton jackpot={false} />
        </div>

        <div className="card col-md-8 mx-auto mt-5 mb-5 text-center px-0 border-warning">
          <div className="card-header">
            <h5 className="card-title">Instructions</h5>
            (Read the technical details at the{' '}
            <a href="https://github.com/friedger/clarity-smart-contracts/blob/master/docs/flip-coin.md">
              source code repo
            </a>
            .)
          </div>
          <ul className="list-group list-group-flush">
            <li className="list-group-item">Claim test tokens from the faucet to get 500k uSTX.</li>
            <li className="list-group-item">Wait a few minutes and refresh the account balance.</li>
            <li className="list-group-item">
              Toggle the switch. Yellow on blue means "HEADS", Blue on yellow means "TAILS"
            </li>
            <li className="list-group-item">
              Press the <i>Enter</i> key or click the <i>Bet ..</i> button to bet 1000 mSTX.
            </li>
            <li className="list-group-item">Wait a few minutes and refresh the account balance.</li>
            <li className="list-group-item">
              Ask somebody else to play the same game (same button) and then after a few minutes
              check the balance again to see whether you won.
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
