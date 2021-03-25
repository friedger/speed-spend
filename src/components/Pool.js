import React, { useRef, useState } from 'react';

import { TxStatus } from '../lib/transactions';

export function Pool({ pool, ownerStxAddress }) {
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  return (
    <div>
      {pool ? (
        <>
          <h5>{pool.name}</h5>
          <h5>{pool.address}</h5>
          <br />
          <div className="input-group ">
            <button className="btn btn-outline-secondary" type="button">
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
