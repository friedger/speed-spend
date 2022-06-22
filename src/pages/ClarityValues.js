import React, { useRef, useState } from 'react';

import {
  uintCV,
  intCV,
  standardPrincipalCV,
  contractPrincipalCV,
  tupleCV,
  cvToHex,
  AddressVersion,
} from '@stacks/transactions';
import { b58ToC32, c32ToB58, versions } from 'c32check';

export default function ClarityValues(props) {
  const data = useRef();
  const type = useRef();
  const [hex, setHex] = useState();
  const toHex = (data, type) => {
    console.log({ data, type, cvToHex });
    let cv;
    switch (type) {
      case 'uint':
        cv = uintCV(data);
        break;
      case 'int':
        cv = intCV(data);
        break;
      case 'principal':
        const dataParts = data.split('.');
        if (dataParts.length > 1) {
          cv = contractPrincipalCV(dataParts[0], dataParts[1]);
        } else {
          cv = standardPrincipalCV(data);
        }
        break;
      case 'tuple':
        cv = tupleCV({ 'reward-cycle': uintCV(data) });
        break;
      default:
        break;
    }
    setHex(cv ? cvToHex(cv) : undefined);
  };

  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Clarity Values</h1>
          Convert Values to Hex and back
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <select ref={type} name="type">
            <option value="uint">uint</option>
            <option value="int">int</option>
            <option value="list">list</option>
            <option value="buff">buff</option>
            <option value="principal">principal</option>
            <option value="tuple">tuple</option>
          </select>
          <input
            ref={data}
            onKeyUp={e => {
              if (e.key === 'Enter') toHex(data.current.value, type.current.value);
            }}
          />
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">{hex}</div>
      </div>
    </main>
  );
}
