import React, { useRef, useState, useEffect } from 'react';

import { authOrigin, NETWORK } from '../lib/constants';
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

export function PoolStackAggregationCommit({ ownerStxAddress, userSession }) {
  console.log({ ownerStxAddress, userSession });
  const { doContractCall } = useStacksJsConnect();
  const cycleId = useRef();

  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ownerStxAddress) {
      setLoading(true);
      fetchAccount(ownerStxAddress)
        .catch(e => {
          setStatus('Failed to access your account', e);
          setLoading(false);
          console.log(e);
        })
        .then(async acc => {
          setStatus(undefined);
          setLoading(false);
          console.log({ acc });
        });
    }
  }, [ownerStxAddress]);

  const commitAction = async () => {
    const cycleIdCV = uintCV(cycleId.current.value.trim());
    const contractAddress = '';
    const contractName = '';
    try {
      setStatus(`Sending transaction`);
      setLoading(true);
      const functionArgs = [cycleIdCV];
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'delegate-stx',
        functionArgs,
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        userSession,
        network: NETWORK,
        finished: data => {
          console.log(data);
          setStatus(undefined);
          setTxId(data.txId);
          setLoading(false);
        },
      });
    } catch (e) {
      console.log(e);
      setStatus(e.toString());
      setLoading(false);
    }
  };

  return (
    <div>
      <h5>Finalize the next cycle</h5>
      <div className="NoteField">
        As the user that finalizes the cycle you will be rewarded 1 STX.
        <input
          type="number"
          ref={cycleId}
          defaultValue={860}
          className="form-control"
          placeholder="Next cycle id"
          onKeyUp={e => {
            if (e.key === 'Enter') commitAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />{' '}
        <br />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={commitAction}>
            <div
              role="status"
              className={`${
                loading ? '' : 'd-none'
              } spinner-border spinner-border-sm text-info align-text-top mr-2`}
            />
            Finalize
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
