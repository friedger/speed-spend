import React, { useRef, useState, useEffect } from 'react';

import { CONTRACT_ADDRESS, NETWORK } from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect } from '@stacks/connect-react';
import { noneCV, PostConditionMode, someCV, stringAsciiCV, uintCV } from '@stacks/transactions';
import * as c32 from 'c32check';
import { nameToUsernameCV } from '../lib/pools';
import { poxAddrCVFromBitcoin } from '../lib/pools-utils';

export function PoolRegister({ ownerStxAddress, username }) {
  const { doContractCall } = useConnect();
  const name = useRef();
  const url = useRef();
  const rewardBtcAddress = useRef();
  const contract = useRef();
  const minimum = useRef();
  const lockingPeriod = useRef();
  const payout = useRef();
  const extendedCheckbox = useRef();

  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();

  const btcAddressFromOwnerStxAddress = ownerStxAddress ? c32.c32ToB58(ownerStxAddress) : '';
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
    }
  }, [ownerStxAddress]);

  const registerAction = async () => {
    spinner.current.classList.remove('d-none');
    const useExt = extendedCheckbox.current.value;
    const usernameCV = nameToUsernameCV(name.current.value.trim());
    if (!usernameCV) {
      setStatus('username must contain exactly one dot (.)');
      return;
    }
    const poxAddressCV = poxAddrCVFromBitcoin(rewardBtcAddress.current.value.trim());
    const urlCV = stringAsciiCV(url.current.value.trim());
    let minimumCV;
    if (minimum.current.value) {
      minimumCV = someCV(uintCV(parseInt(minimum.current.value)));
    } else {
      minimumCV = noneCV();
    }

    const lockingPeriodCV = lockingPeriod.current.value.trim()
      ? someCV(uintCV(parseInt(lockingPeriod.current.value)))
      : noneCV();
    const payoutCV = stringAsciiCV(payout.current.value.trim());
    const functionName = useExt ? 'register-ext' : 'register';
    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: "ST2ZRX0K27GW0SP3GJCEMHD95TQGJMKB7G9Y0X1MH",
        contractName: 'pool-registry',
        functionName,
        functionArgs: [usernameCV, poxAddressCV, urlCV, minimumCV, lockingPeriodCV, payoutCV],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        network: NETWORK,
        finished: data => {
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
      <h5>Register a pool</h5>
      <div className="NoteField">
        Pool's name, e.g. alice.id (must contain 1 dot)
        <input
          type="text"
          ref={name}
          className="form-control"
          defaultValue={username}
          placeholder="Name, e.g. alice.id"
          onKeyUp={e => {
            if (e.key === 'Enter') url.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        Pool's Website
        <input
          type="text"
          ref={url}
          className="form-control"
          defaultValue={username}
          placeholder="Url"
          onKeyUp={e => {
            if (e.key === 'Enter') rewardBtcAddress.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        Reward BTC address
        <input
          type="text"
          ref={rewardBtcAddress}
          className="form-control"
          defaultValue={btcAddressFromOwnerStxAddress}
          placeholder="Pool's reward BTC address"
          onKeyUp={e => {
            if (e.key === 'Enter') contract.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        Contract ID
        <input
          type="text"
          ref={contract}
          className="form-control"
          defaultValue="ST000000000000000000002AMW42H.pox"
          placeholder="Pool's Contract ID"
          onKeyUp={e => {
            if (e.key === 'Enter') extendedCheckbox.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <input
          name="extendedContract"
          type="checkbox"
          ref={extendedCheckbox}
          className="checkbox"
          placeholder="Use extended trait"
          onKeyUp={e => {
            if (e.key === 'Enter') minimum.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <label htmlFor="extendedContract">Extended Contract</label>
        <br />
        Minimum STX required to join
        <input
          type="number"
          ref={minimum}
          className="form-control"
          defaultValue=""
          placeholder="Minimum STX required for joining"
          onKeyUp={e => {
            if (e.key === 'Enter') lockingPeriod.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        Locking period/number of locking cycles. Leave empty if variable.
        <input
          type="number"
          ref={lockingPeriod}
          className="form-control"
          placeholder="Leave empty if not fixed by contract"
          onKeyUp={e => {
            if (e.key === 'Enter') payout.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        How the Pool payouts rewards
        <input
          type="text"
          ref={payout}
          className="form-control"
          defaultValue="BTC"
          placeholder="e.g. BTC, STX, WMNO"
          onKeyUp={e => {
            if (e.key === 'Enter') registerAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={registerAction}>
            <div
              ref={spinner}
              role="status"
              className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
            />
            Register
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
  );
}
