import React, { useRef } from 'react';

import { useNavigate } from '@reach/router';
import PoolInfo from './PoolInfo';

export function Pool({ pool, poolId, ownerStxAddress }) {
  const navigate = useNavigate();
  const spinner = useRef();
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
        </>
      ) : (
        <>
          <br />
          Pool does not exist.
          <br />
          <br />
        </>
      )}
    </div>
  );
}
