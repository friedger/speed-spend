import { useConnect } from '@stacks/connect-react';
import { ClarityType, cvToString, PostConditionMode, uintCV } from '@stacks/transactions';
import React, { useRef, useState } from 'react';
import { NETWORK } from '../lib/constants';
import { poxCVToBtcAddress } from '../lib/pools-utils';

import { TxStatus } from '../lib/transactions';
import { useNavigate } from '@reach/router';
import PoolInfo from './PoolInfo';

export function Pool({ pool, poolId, ownerStxAddress }) {
  const navigate = useNavigate();

  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();

  return (
    <div>
      {pool ? (
        <>
          <PoolInfo pool={pool} />
          <div className="input-group ">
            <button
              className="btn btn-outline-secondary"
              type="button"
              onClick={() => {
                navigate(`/pools/${poolId}`, { state: { pool } });
              }}
            >
              <div
                ref={spinner}
                role="status"
                className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
              />
              Join Pool
            </button>
          </div>

          <br />
          <TxStatus txId={txId} resultPrefix="Delegation confirmed in block:" />
        </>
      ) : (
        <>
          <br />
          Pool does not exist.
          <br />
          <br />
        </>
      )}

      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
