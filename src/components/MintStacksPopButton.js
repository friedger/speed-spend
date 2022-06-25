import React, { useRef, useState, useEffect } from 'react';

import { fetchAccount } from '../lib/account';
import { useConnect } from '@stacks/connect-react';
import { PostConditionMode } from '@stacks/transactions';
import { STACKSPOPS_CONTRACT_TEST, NETWORK } from '../lib/constants';
import { TxStatus } from '../lib/transactions';

export function MintStacksPopButton({ ownerStxAddress }) {
  const { doContractCall } = useConnect();
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

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: STACKSPOPS_CONTRACT_TEST,
        contractName: 'test-pops-v1',
        functionName: 'mint',
        functionArgs: [],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        network: NETWORK,
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
      <h5>Mint a StacksPop</h5>
      <button className="btn btn-primary" type="button" onClick={sendAction}>
        <div
          ref={spinner}
          role="status"
          className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
        />
        MINT
      </button>
      <div>
        <TxStatus txId={txId} resultPrefix="Stacks Pops was created with id " />
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
