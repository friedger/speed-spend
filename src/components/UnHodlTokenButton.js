import React, { useRef, useState, useEffect } from 'react';

import { useConnect } from '../lib/auth';
import {
  uintCV,
  makeStandardFungiblePostCondition,
  makeContractFungiblePostCondition,
  FungibleConditionCode,
  createAssetInfo,
} from '@stacks/transactions';
import { fetchAccount } from '../lib/account';
import { fetchHodlTokenBalance } from '../lib/holdTokens';
import { CONTRACT_ADDRESS, HODL_TOKEN_CONTRACT, NETWORK } from '../lib/constants';
import { TxStatus } from '../lib/transactions';
const BigNum = require('bn.js');

export function UnHodlTokenButton({ title, placeholder, ownerStxAddress }) {
  const { doContractCall } = useConnect();
  const textfield = useRef();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();

  useEffect(() => {
    if (ownerStxAddress) {
      fetchAccount(ownerStxAddress)
        .catch(e => {
          setStatus('Failed to access your account', e);
          console.log(e);
        })
        .then(async acc => {
          console.log({ acc });
        });
    }
  }, [ownerStxAddress]);

  const sendAction = async () => {
    spinner.current.classList.remove('d-none');

    var amountString = textfield.current.value.trim();
    const amount = parseInt(amountString);

    // check balance
    const acc = await fetchHodlTokenBalance(ownerStxAddress);
    const balance = acc ? parseInt(acc.balance, 16) : 0;
    if (balance < amount) {
      setStatus(`Your balance is below ${amount} uSTX`);
      spinner.current.classList.add('d-none');
      return;
    }

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: HODL_TOKEN_CONTRACT,
        functionName: 'unhodl',
        functionArgs: [uintCV(amount)],
        postConditions: [
          makeStandardFungiblePostCondition(
            ownerStxAddress,
            FungibleConditionCode.LessEqual,
            new BigNum(amount),
            new createAssetInfo(CONTRACT_ADDRESS, HODL_TOKEN_CONTRACT, 'hodl-token')
          ),
          makeContractFungiblePostCondition(
            CONTRACT_ADDRESS,
            HODL_TOKEN_CONTRACT,
            FungibleConditionCode.LessEqual,
            new BigNum(amount),
            new createAssetInfo(CONTRACT_ADDRESS, HODL_TOKEN_CONTRACT, 'spendable-token')
          ),
        ],
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
      Unhodl tokens (make them spendable)
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
            Unhodl
          </button>
        </div>
      </div>
      <TxStatus txId={txId} />
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
