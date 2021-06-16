import React, { useRef, useState, useEffect } from 'react';

import {
  CONTRACT_ADDRESS,
  infoApi,
  NETWORK,
  ROCKET_FACTORY_CONTRACT_NAME,
} from '../../lib/constants';
import { TxStatus } from '../../lib/transactions';
import { fetchAccount } from '../../lib/account';
import { useConnect } from '@stacks/connect-react';
import { PostConditionMode } from '@stacks/transactions';
import { fetchOrderBook } from '../../lib/rockets';
import { RosettaConstructionPayloadResponseToJSON } from '@stacks/blockchain-api-client';

export function ClaimRocket({ ownerStxAddress }) {
  const { doContractCall } = useConnect();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [order, setOrder] = useState();
  const [blockheight, setBlockheight] = useState();
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
        });

      fetchOrderBook(ownerStxAddress)
        .then(async order => {
          console.log({ order });
          setStatus(undefined);
          setOrder(order);
        })
        .catch(e => {
          setStatus('Failed to get rockets of your account', e);
          console.log(e);
        });
      infoApi.getCoreApiInfo().then(r => setBlockheight(r.stacks_tip_height));
    }
  }, [ownerStxAddress]);

  const claimAction = async () => {
    spinner.current.classList.remove('d-none');

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: ROCKET_FACTORY_CONTRACT_NAME,
        functionName: 'claim-rocket',
        functionArgs: [],
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
  console.log(blockheight)
  const canBeClaimed = blockheight && order && blockheight > order.readyAtBlock
  return (
    <>
      {order && (
        <div>
          <h5>Get your ordered rocket</h5>
          {canBeClaimed && <p>Ready since {blockheight - order.readyAtBlock} blocks</p>}
          {!canBeClaimed && blockheight && <p>Ready in {order.readyAtBlock -blockheight} blocks</p>}
          <div className="NoteField input-group ">
            <div className="input-group-append">
              <button
                className="btn btn-outline-secondary"
                type="button"
                disabled={!canBeClaimed}
                onClick={claimAction}
              >
                <div
                  ref={spinner}
                  role="status"
                  className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
                />
                Claim Rocket
              </button>
            </div>
          </div>
          <div>
            <TxStatus txId={txId} resultPrefix="Order placed in block " />
          </div>
          {status && (
            <>
              <div>{status}</div>
            </>
          )}
        </div>
      )}
    </>
  );
}
