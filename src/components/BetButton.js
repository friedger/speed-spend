import React, { useRef, useState, useEffect } from 'react';
import {
  addressToString,
  trueCV,
  falseCV,
  makeStandardSTXPostCondition,
  FungibleConditionCode,
  makeContractSTXPostCondition,
  PostConditionMode,
} from '@stacks/transactions';
import Switch from 'react-input-switch';

import { getStacksAccount, fetchAccount } from '../lib/account';
import { NETWORK, CONTRACT_ADDRESS, STACKS_API_WS_URL } from '../lib/constants';
import {
  fetchJackpot,
  AtTwoState,
  fetchWinnerAt,
  fetchAtTwoState,
  JackpotState,
} from '../lib/flipCoin';
import { fetchHodlTokenBalance } from '../lib/holdTokens';

import { useConnect } from '@stacks/connect-react';
import { connectWebSocketClient, TransactionsApi } from '@stacks/blockchain-api-client';
import { useAtomValue } from 'jotai/utils';
import { userSessionState } from '../lib/auth';
import { useStxAddresses } from '../lib/hooks';
const BigNum = require('bn.js');

export function BetButton({ jackpot }) {
  const userSession = useAtomValue(userSessionState);
  const { doContractCall } = useConnect();
  const spinner = useRef();
  const [betValue, setBetValue] = useState(0);
  const [status, setStatus] = useState();
  const [account, setAccount] = useState();
  const [jackpotValue, setJackpotValue] = useState();
  const [txId, setTxId] = useState();
  const { ownerStxAddress, appStxAddress } = useStxAddresses(userSession);

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      const appPrivateKey = userData.appPrivateKey;
      const id = getStacksAccount(appPrivateKey);
      console.log({ userData, id });
      fetchAccount(ownerStxAddress)
        .catch(e => {
          setStatus('Failed to access your account', e);
          console.log(e);
        })
        .then(async acc => {
          setAccount(acc);
          console.log({ acc });
        });
      fetchJackpot(ownerStxAddress).then(jackpot => {
        if (jackpot) {
          setJackpotValue(jackpot);
        }
      });

      fetchWinnerAt(CONTRACT_ADDRESS, 200).then(r => {
        console.log(r);
      });
    }
  }, [userSession, ownerStxAddress]);

  const betAction = async () => {
    spinner.current.classList.remove('d-none');

    // check balance
    const acc = await fetchAccount(appStxAddress).catch(e => {
      setStatus('Failed to access your account', e);
      console.log(e);
    });
    const balance = acc ? parseInt(acc.balance, 16) : 0;
    if (balance < 1000) {
      const hodlBalanceString = await fetchHodlTokenBalance(ownerStxAddress);
      const hodlBalance = hodlBalanceString ? parseInt(hodlBalanceString) : 0;
      console.log(hodlBalanceString, hodlBalance);
      if (hodlBalance < 10) {
        setStatus(
          'Your hodl balance is below 1000 uSTX and you have not hodled at least 10 HODL tokens'
        );
        spinner.current.classList.add('d-none');
        return;
      }
    }

    if (!jackpot) {
      const atTwoState = await fetchAtTwoState();
      if (atTwoState) {
        if (
          (betValue && atTwoState.nextSlot.betTrue) ||
          (!betValue && atTwoState.nextSlot.betFalse)
        ) {
          setStatus(`The seat for ${betValue ? 'HEAD' : 'TAILS'} is already taken.`);
          spinner.current.classList.add('d-none');
          return;
        }
      }
    }

    console.log(`Betting on ${betValue} using jackpot ${jackpot}`);

    try {
      const postConditions = [
        makeStandardSTXPostCondition(
          ownerStxAddress,
          FungibleConditionCode.LessEqual,
          new BigNum(1000)
        ),
        makeContractSTXPostCondition(
          CONTRACT_ADDRESS,
          jackpot ? 'flip-coin-jackpot' : 'flip-coin-at-two',
          FungibleConditionCode.GreaterEqual,
          new BigNum(0)
        ),
      ];

      doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: jackpot ? 'flip-coin-jackpot' : 'flip-coin-at-two',
        functionName: 'bet',
        functionArgs: [betValue ? trueCV() : falseCV()],
        network: NETWORK,
        postConditions: postConditions,
        postConditionMode: PostConditionMode.Allow,
        finished: result => {
          console.log(result);
          spinner.current.classList.add('d-none');
          setTxId(result.txId);
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
      <div className="pb-4">Note, you need to hodl 1000+ uSTX or hold 10 Hodl tokens!</div>
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
      <div>
        <BetResult txId={txId} />
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
      {!jackpot && (
        <div>
          <AtTwoState />
        </div>
      )}
      {jackpot && (
        <div>
          <JackpotState />
        </div>
      )}
    </div>
  );
}

export function BetResult({ txId }) {
  const [processingResult, setProcessingResult] = useState({ loading: false });
  const spinner = useRef();

  useEffect(() => {
    console.log(txId);
    if (!txId) {
      return;
    }

    spinner.current.classList.remove('d-none');
    setProcessingResult({ loading: true });

    let sub;
    let client;
    const subscribe = async (txId, update) => {
      client = await connectWebSocketClient(STACKS_API_WS_URL);
      sub = await client.subscribeTxUpdates(txId, update);
      console.log({ client, sub });
    };

    subscribe(txId, async event => {
      console.log(event);
      let result;
      if (event.tx_status === 'pending') {
        return;
      } else if (event.tx_status === 'success') {
        const tx = await new TransactionsApi().getTransactionById({ txId });
        console.log(tx);
        const optionalWinner = await fetchWinnerAt(CONTRACT_ADDRESS, tx.block_height - 1);
        result = optionalWinner;
      } else if (event.tx_status.startsWith('abort')) {
        result = undefined;
      }
      spinner.current.classList.add('d-none');
      setProcessingResult({ loading: false, result });
      await sub.unsubscribe();
    });
  }, [txId, spinner]);

  if (!txId) {
    return null;
  }

  return (
    <>
      {processingResult.loading && (
        <>
          Checking transaction status:{' '}
          <a href={`https://testnet-explorer.blockstack.org/txid/0x${txId}`}>{txId}</a>
        </>
      )}
      {!processingResult.loading && processingResult.result && <>{processingResult.result.repr}</>}{' '}
      <div
        ref={spinner}
        role="status"
        className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
      />
    </>
  );
}
