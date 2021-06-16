import React, { useRef, useState, useEffect } from 'react';

import {
  authOrigin,
  CONTRACT_ADDRESS,
  GENESIS_CONTRACT_ADDRESS,
  infoApi,
  NETWORK,
  POOL_ADMIN_CONTRACT_NAME,
  POOL_AUDIT_CONTRACT_NAME,
  smartContractsApi,
} from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect as useStacksJsConnect } from '@stacks/connect-react';
import {
  bufferCV,
  ClarityType,
  contractPrincipalCV,
  cvToHex,
  hexToCV,
  PostConditionMode,
  standardPrincipalCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import BN from 'bn.js';
export async function getPartialStacked(poolAdmin, rewardCycle, btcAddress) {
  const [part1, part2] = poolAdmin.split('.');
  const key = cvToHex(
    tupleCV({
      'pox-addr': tupleCV({
        hashbytes: bufferCV(Buffer.from(btcAddress.hashBytes, 'hex')),
        version: bufferCV(Buffer.from(btcAddress.version, 'hex')),
      }),
      'reward-cycle': uintCV(rewardCycle),
      sender: part2 ? contractPrincipalCV(part1, part2) : standardPrincipalCV(poolAdmin),
    })
  );
  try {
    const amountHex = await smartContractsApi.getContractDataMapEntry({
      contractAddress: GENESIS_CONTRACT_ADDRESS,
      contractName: 'pox',
      mapName: 'partial-stacked-by-cycle',
      key,
      proof: 0,
    });
    const amountCV = hexToCV(amountHex.data);
    if (amountCV.type === ClarityType.OptionalNone) {
      return { amount: 'none', cycle: rewardCycle, poolAdmin, btcAddress };
    } else {
      return {
        amount: amountCV.value.data['stacked-amount'].value.toString(10),
        cycle: rewardCycle,
        poolAdmin,
        btcAddress,
      };
    }
  } catch (e) {
    console.log(e);
  }
}

export function PoolStackAggregationCommit({ ownerStxAddress, userSession }) {
  console.log({ ownerStxAddress, userSession });
  const { doContractCall } = useStacksJsConnect();
  const cycleId = useRef();

  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [loading, setLoading] = useState(false);
  const [rewardCycleId, setRewardCycleId] = useState(860);
  const [burnBlockHeight, setBurnBlockHeight] = useState();
  const [blocksUntilNextCycle, setBlocksUntilNextCycle] = useState(100);
  const [minimum, setMinimum] = useState(10000000);
  const [lockedStx, setLockedStx] = useState(0);

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
    infoApi.getPoxInfo().then(poxInfo => {
      const cycleId = poxInfo.reward_cycle_id;
      setMinimum(poxInfo.min_amount_ustx);
      setRewardCycleId(cycleId);
      getPartialStacked(`${CONTRACT_ADDRESS}.${POOL_ADMIN_CONTRACT_NAME}`, cycleId, {
        hashBytes: 'c70e1ca5a5ef633fe5464821ca421c173997f388',
        version: '00',
      }).then(r => {
        console.log(r, r.amount === 'none');
        if (r.amount !== 'none')
          setLockedStx(
            new BN(r.amount)
              .div(new BN(1000000))
              .toNumber()
              .toLocaleString(undefined, { styyle: 'decimal' })
          );
      });
    });
    infoApi.getCoreApiInfo().then(info => {
      setBurnBlockHeight(info.burn_block_height);
      setBlocksUntilNextCycle(50 - ((info.burn_block_height - 10) % 50));
    });
  }, [ownerStxAddress]);

  const commitAction = async () => {
    const cycleIdCV = uintCV(cycleId.current.value.trim());
    const contractAddress = CONTRACT_ADDRESS;
    const contractName = POOL_ADMIN_CONTRACT_NAME;
    try {
      setStatus(`Sending transaction`);
      setLoading(true);
      const functionArgs = [cycleIdCV];
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'stack-aggregation-commit',
        functionArgs,
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
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
      <h5>Finalize the next cycle</h5>
      <div className="NoteField">
        As the user that finalizes the cycle you will be rewarded 1 STX. You can do this only
        <ul>
          <li>50 blocks before the start of the next cycle and </li>
          <li>if there are enough stacks locked (&gt; 86m STX)</li>
        </ul>
        Current block: {burnBlockHeight}
        <br />
        Blocks until next cycle: {blocksUntilNextCycle}
        <br />
        Current locked STX: {lockedStx}
        <br />
        Next cycle id:
        <input
          type="number"
          ref={cycleId}
          value={rewardCycleId}
          className="form-control"
          placeholder="Next cycle id"
          readOnly
          onChange={e => {
            setRewardCycleId(parseInt(e.target.value));
          }}
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
