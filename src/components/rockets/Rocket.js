import React, { useRef, useState, useEffect } from 'react';

import { TxStatus } from '../../lib/transactions';
import { BuyRocket } from './BuyRocket';
import { AuthorizePilotButton } from './AuthorizePilotButton';
import { fetchRocketDetails } from '../../lib/rockets';
import { FlyButton } from './FlyButton';
import { Pilots } from './Pilots';

export function Rocket({ rocketId, ownerStxAddress, showPilots }) {
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [rocketDetails, setRocketDetails] = useState();

  const rocketIdNumber = parseInt(rocketId);

  useEffect(() => {
    if (rocketId) {
      fetchRocketDetails(rocketId)
        .then(details => {
          console.log({ details });
          setRocketDetails(details);
        })
        .catch(e => console.log(e));
    } else {
      console.log('no rocketId');
    }
  }, [rocketId]);

  return (
    <div>
      {rocketDetails ? (
        <>
          <img
            src={`/rockets/ship-${Math.floor(rocketDetails.metaData.size / 5)}.png`}
            alt="rocket ship"
            width="100"
          />
          <br />
          Size {rocketDetails.metaData.size}
          <br />
          <small>ID: {rocketIdNumber}</small>
          {!showPilots && (
            <FlyButton
              spinner={spinner}
              rocketId={rocketId}
              setStatus={setStatus}
              setTxId={setTxId}
            />
          )}
          <AuthorizePilotButton ownerStxAddress={ownerStxAddress} rocketId={rocketId} />
          {showPilots && (
            <Pilots
              ownerStxAddress={ownerStxAddress}
              rocketId={rocketId}
              rocketOwner={rocketDetails.owner}
            />
          )}
          <br />
          <TxStatus txId={txId} resultPrefix="Flight confirmed in block:" />
        </>
      ) : (
        <>
          <br />
          This rocket has not yet been ordered.
          <br />
          <br />
          <BuyRocket ownerStxAddress={ownerStxAddress} />
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
