import React, { useState, useEffect } from 'react';

import { infoApi } from '../lib/constants';
import { fetchAccount } from '../lib/account';

export function PoolState({ ownerStxAddress, userSession }) {
  console.log({ ownerStxAddress, userSession });

  const [status, setStatus] = useState();
  const [info, setInfo] = useState();

  const updatePoxInfo = async () => {
    const poxInfo = await infoApi.getPoxInfo();
    const coreInfo = await infoApi.getCoreApiInfo();
    console.log({ coreInfo, poxInfo });
    setInfo({ coreInfo, poxInfo });
  };

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
    updatePoxInfo();
  }, [ownerStxAddress]);

  return (
    <div>
      <h5>Pool State</h5>
      {info && <>Current cycle: #{info.poxInfo.reward_cycle_id}</>}
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
