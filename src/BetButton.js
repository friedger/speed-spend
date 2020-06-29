import React, { useRef, useState, useEffect } from 'react';
import { useBlockstack } from 'react-blockstack';
import {
  makeContractCall,
  privateKeyToString,
  addressToString,
  trueCV,
  falseCV,
  broadcastTransaction,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  makeContractSTXPostCondition,
  deserializeCV,
} from '@blockstack/stacks-transactions';
import Switch from 'react-input-switch';

import {
  getStacksAccount,
  fetchAccount,
  NETWORK,
  CONTRACT_ADDRESS,
  resultToStatus,
} from './StacksAccount';
const BigNum = require('bn.js');

export function BetButton({ jackpot }) {
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
      `${NETWORK.coreApiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/flip-coin-jackpot/get-jackpot`,
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
        contractAddress: CONTRACT_ADDRESS,
        contractName: jackpot ? 'flip-coin-jackpot' : 'flip-coin-at-two',
        functionName: 'bet',
        functionArgs: [betValue ? trueCV() : falseCV()],
        senderKey: privateKeyToString(identity.privateKey),
        network: NETWORK,
        postConditions: [
          makeStandardSTXPostCondition(
            addressToString(identity.address),
            FungibleConditionCode.LessEqual,
            new BigNum(1000)
          ),
          makeContractSTXPostCondition(
            CONTRACT_ADDRESS,
            jackpot ? 'flip-coin-jackpot' : 'flip-coin-at-two',
            FungibleConditionCode.GreaterEqual,
            new BigNum(0)
          ),
        ],
      });
      console.log(transaction);
      const result = await broadcastTransaction(transaction, NETWORK);
      console.log(result);
      spinner.current.classList.add('d-none');
      setStatus(resultToStatus(result));
    } catch (e) {
      console.log(e);
      setStatus(e.toString());
      spinner.current.classList.add('d-none');
    }
  };

  return (
    <div>
      Bet 1000uSTX on "HEADS" ("true") or "TAILS" ("false") and{' '}
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
