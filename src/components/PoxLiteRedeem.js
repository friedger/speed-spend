import React, { useRef, useState, useEffect } from 'react';

import { fetchAccount } from '../lib/account';
import { useConnect as useStacksJsConnect } from '@stacks/connect-react';
import { TxStatus } from '../lib/transactions';
import { NETWORK } from '../lib/constants';
import {
  createAssetInfo,
  createFungiblePostCondition,
  createSTXPostCondition,
  FungibleConditionCode,
  uintCV,
} from '@stacks/transactions';
import * as BN from 'bn.js';

const contractAddress = 'STSJHY3X84C0KV5NDB12FR07ETP5XXG51B8XAWSK';
const contractName = 'experimental-yellow-stinger';

export function PoxLiteRedeem({ ownerStxAddress, userSession }) {
  const { doContractCall } = useStacksJsConnect();
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

    var amountAsString = textfield.current.value.trim();
    var amount = parseInt(amountAsString);

    // check balance
    const acc = await fetchAccount(ownerStxAddress);
    const balance = acc ? parseInt(acc.balance, 16) : 0;

    try {
      setStatus(`Sending transaction`);
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'redeem-stinger',
        functionArgs: [uintCV(amount)],
        userSession,
        network: NETWORK,
        postConditions: [
          createFungiblePostCondition(
            ownerStxAddress,
            FungibleConditionCode.Equal,
            new BN(amount),
            createAssetInfo(contractAddress, contractName, 'stinger')
          ),
          createSTXPostCondition(
            `${contractAddress}.${contractName}`,
            FungibleConditionCode.Equal,
            new BN(amount)
          ),
        ],
        onFinish: data => {
          console.log(data);
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
      Redeem Stinger tokens
      <div className="NoteField input-group ">
        <input
          type="decimal"
          ref={textfield}
          className="form-control"
          defaultValue={''}
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
            Redeem
          </button>
        </div>
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
      <div>
        <TxStatus txId={txId} resultPrefix="Deposit sent: " />
      </div>
    </div>
  );
}
