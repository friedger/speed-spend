import React, { useRef, useState, useEffect } from 'react';

import {
  BTC_STX_SWAP_CONTRACT,
  CONTRACT_ADDRESS,
  infoApi,
  NETWORK,
  POOL_ADMIN_CONTRACT_NAME,
} from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect as useStacksJsConnect } from '@stacks/connect-react';
import {
  bufferCV,
  bufferCVFromString,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
  PostConditionMode,
  standardPrincipalCV,
  uintCV,
} from '@stacks/transactions';
import BN from 'bn.js';
import { decodeBtcAddress } from '@stacks/stacking';

export function SwapCreate({ ownerStxAddress, userSession }) {
  console.log({ ownerStxAddress, userSession });
  const { doContractCall } = useStacksJsConnect();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [loading, setLoading] = useState(false);
  const [sats, setSats] = useState(1000);
  const [ustx, setUstx] = useState(1000000);
  const [btcReceiver, setBtcReceiver] = useState('myEF4iW1eZcwgYsmsSpNA1kwnMwqgyZWMU');
  const [stxReceiver, setStxReceiver] = useState('ST82S7H3DPXG6NN2YGW413DSK5Q83BT59D0RXFZ5');
  const [expiry, setExpiry] = useState();

  const createAction = async () => {
    const satsCV = uintCV(sats);
    const ustxCV = uintCV(ustx);
    const btcReceiverCV = bufferCV(
      Buffer.concat([
        Buffer.from('76a914', 'hex'),
        decodeBtcAddress(btcReceiver).data,
        Buffer.from('88ac', 'hex'),
      ])
    );
    const stxReceiverCV = standardPrincipalCV(stxReceiver);
    const contractAddress = BTC_STX_SWAP_CONTRACT.address;
    const contractName = BTC_STX_SWAP_CONTRACT.name;
    try {
      setStatus(`Sending transaction`);
      setLoading(true);
      const functionArgs = [satsCV, btcReceiverCV, ustxCV, stxReceiverCV];
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'create-swap',
        functionArgs,
        postConditionMode: PostConditionMode.Deny,
        postConditions: [
          makeStandardSTXPostCondition(
            ownerStxAddress,
            FungibleConditionCode.LessEqual,
            new BN(ustx)
          ),
        ],
        userSession,
        network: NETWORK,
        onFinish: data => {
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
      <h5>Start to Swap</h5>
      <div>
        How many micro stacks do you want to send?
        <input
          type="number"
          value={ustx}
          className="form-control"
          placeholder="Micro stacks"
          onChange={e => setUstx(parseInt(e.target.value.trim()))}
          onBlur={e => {
            setStatus(undefined);
          }}
        />{' '}
        <br />
        Who should receive Stacks?
        <input
          type="text"
          value={stxReceiver}
          className="form-control"
          placeholder="STX address"
          onChange={e => setStxReceiver(e.target.value.trim())}
          onBlur={e => {
            setStatus(undefined);
          }}
        />{' '}
        <br />
        How many Sats do you want to receive?
        <input
          type="number"
          value={sats}
          className="form-control"
          placeholder="Sats"
          onChange={e => setSats(parseInt(e.target.value.trim()))}
          onBlur={e => {
            setStatus(undefined);
          }}
        />{' '}
        <br />
        Where do you want to receive your BTC?
        <input
          type="text"
          value={btcReceiver}
          className="form-control"
          placeholder="BTC address"
          onChange={e => setBtcReceiver(e.target.value.trim())}
          onBlur={e => {
            setStatus(undefined);
          }}
        />{' '}
        <br />
        When does the swap expire (number of blocks)?
        <input
          type="number"
          defaultValue={100}
          className="form-control"
          placeholder="Number of blocks"
          readOnly
          onBlur={e => {
            setStatus(undefined);
          }}
        />{' '}
        <br />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={createAction}>
            <div
              role="status"
              className={`${
                loading ? '' : 'd-none'
              } spinner-border spinner-border-sm text-info align-text-top mr-2`}
            />
            Deposit STX
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
