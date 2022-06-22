import React, { useRef, useState } from 'react';

import {
  uintCV,
  intCV,
  standardPrincipalCV,
  contractPrincipalCV,
  tupleCV,
  cvToHex,
} from '@stacks/transactions';
import { b58ToC32, c32ToB58 } from 'c32check';

export default function AddressConversion() {
  const address = useRef();
  const [stxAddress, setStxAddress] = useState();
  const [btcAddress, setBtcAddress] = useState();

  const convertAddress = address => {
    try {
      setStxAddress(`${b58ToC32(address)}`);
    } catch (e) {
      setStxAddress(address);
    }
    try {
      setBtcAddress(`${c32ToB58(address)}`);
    } catch (e) {
      setBtcAddress(address);
    }
  };

  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">STX/BTC address conversion </h1>
          Convert addresses from base58 to c32check and vice versa
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <input
            ref={address}
            onKeyUp={e => {
              if (e.key === 'Enter') convertAddress(address.current.value.trim());
            }}
          />
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">{stxAddress}</div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">{btcAddress}</div>
      </div>
    </main>
  );
}
