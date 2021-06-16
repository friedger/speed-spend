import React from 'react';import { useConnect } from '@stacks/connect-react';

import { PostConditionMode, uintCV } from '@stacks/transactions';

import { CONTRACT_ADDRESS, NETWORK, ROCKET_MARKET_CONTRACT_NAME } from '../../lib/constants';

export function FlyButton({ rocketId, spinner, setStatus, setTxId }) {
  const { doContractCall } = useConnect();
  const flyAction = async () => {
    spinner.current.classList.remove('d-none');

    try {
      setStatus(`Sending transaction`);
      console.log({ rocketId });
      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: ROCKET_MARKET_CONTRACT_NAME,
        functionName: 'fly-ship',
        functionArgs: [uintCV(rocketId)],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
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
    <>
      <br />
      <div className="input-group ">
        <button className="btn btn-outline-secondary" type="button" onClick={flyAction}>
          <div
            ref={spinner}
            role="status"
            className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
          />
          Fly
        </button>
      </div>
    </>
  );
}
