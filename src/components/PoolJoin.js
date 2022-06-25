import React, { useRef, useState, useEffect } from 'react';

import { NETWORK } from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect as useStacksJsConnect } from '@stacks/connect-react';
import {
  bufferCV,
  ClarityType,
  contractPrincipalCV,
  cvToString,
  noneCV,
  PostConditionMode,
  someCV,
  standardPrincipalCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import * as c32 from 'c32check';
import { poxAddrCV, poxAddrCVFromBitcoin } from '../lib/pools-utils';
import PoolInfo from './PoolInfo';

function getPayout(pool) {
  switch (pool.data.payout.data) {
    case 'BTC':
      return 'BTC';
    case 'STX':
      return 'STX';
    default:
      return undefined;
  }
}

function getPayoutAddress(payout, stxAddress) {
  console.log({ payout, stxAddress });
  if (!stxAddress) return undefined;
  switch (payout) {
    case 'BTC':
      return c32.c32ToB58(stxAddress);
    case 'STX':
      return stxAddress;
    default:
      return stxAddress;
  }
}

function getPayoutAddressCV(payout, address) {
  switch (payout) {
    case 'BTC':
      return poxAddrCVFromBitcoin(address);
    case 'STX':
      return poxAddrCV(address);
    default:
      return tupleCV({
        hashbytes: bufferCV(Buffer.from([0])),
        version: bufferCV(Buffer.from([0])),
      });
  }
}

export function PoolJoin({ pool, ownerStxAddress, userSession }) {
  const { doContractCall } = useStacksJsConnect();
  const amount = useRef();
  const duration = useRef();
  const payoutAddress = useRef();
  const lockingPeriod = useRef();

  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [availableAmount, setAvailableAmount] = useState();
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
          setAvailableAmount(parseInt(acc.balance) / 1000000);
        });
    }
  }, [ownerStxAddress]);

  const useExt = pool.data.contract.type === ClarityType.OptionalNone;
  const contractId = useExt
    ? cvToString(pool.data['extended-contract'].value)
    : cvToString(pool.data.contract.value);
  const [contractAddress, contractName] = contractId.split('.');
  const delegatee = cvToString(pool.data.delegatee);
  const parts = delegatee.split('.');
  const delegateeCV =
    parts.length < 2 ? standardPrincipalCV(parts[0]) : contractPrincipalCV(parts[0], parts[1]);
  const rewardBtcAddressCV =
    pool.data['pox-address'].length === 1 ? someCV(pool.data['pox-address'][0]) : noneCV();
  const payout = getPayout(pool);
  const userPayoutAddress = getPayoutAddress(payout, ownerStxAddress);

  console.log({ poolData: pool.data });
  const joinAction = async () => {
    spinner.current.classList.remove('d-none');

    const amountCV = uintCV(amount.current.value.trim());
    const durationCV = duration.current.value.trim()
      ? someCV(uintCV(duration.current.value.trim()))
      : noneCV();
    const payoutAddressCV = getPayoutAddressCV(payout, payoutAddress.current.value.trim());
    const lockingPeriodCV = uintCV(lockingPeriod.current.value.trim());
    try {
      setStatus(`Sending transaction`);
      const functionArgs = useExt
        ? [amountCV, delegateeCV, durationCV, rewardBtcAddressCV, payoutAddressCV, lockingPeriodCV]
        : [amountCV, delegateeCV, durationCV, rewardBtcAddressCV];
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'delegate-stx',
        functionArgs,
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        userSession,
        network: NETWORK,
        onFinish: data => {
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
      <h5>Join the pool</h5>
      <PoolInfo pool={pool} />
      <div className="NoteField">
        Choose an amount, how much you would like to "delegately" stack through this pool.
        <input
          type="number"
          ref={amount}
          defaultValue={availableAmount}
          className="form-control"
          placeholder="Amount in STX"
          onKeyUp={e => {
            if (e.key === 'Enter') duration.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        Duration of your pool membership
        <input
          type="text"
          ref={duration}
          className="form-control"
          placeholder="Leave empty for indefinite duration"
          onKeyUp={e => {
            if (e.key === 'Enter') lockingPeriod.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        Locking Period (How long do you want to swim this time)
        <input
          type="text"
          ref={lockingPeriod}
          className="form-control"
          placeholder="Number of cycles"
          disabled={!useExt}
          readOnly={pool && pool.data['locking-period'].type === ClarityType.List}
          defaultValue={
            pool && pool.data['locking-period'].type === ClarityType.List
              ? pool.data['locking-period'].list.map(lp => lp.value.toString(10)).join(' - ')
              : ''
          }
          onKeyUp={e => {
            if (e.key === 'Enter') payoutAddress.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        Payout address (How you would like to get your rewards)
        <input
          type="text"
          ref={payoutAddress}
          className="form-control"
          defaultValue={userPayoutAddress}
          disabled={!useExt}
          onKeyUp={e => {
            if (e.key === 'Enter') joinAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={joinAction}>
            <div
              ref={spinner}
              role="status"
              className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
            />
            Delegate
          </button>
        </div>
      </div>
      <div>
        <TxStatus txId={txId} resultPrefix="You joined the pool " />
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
