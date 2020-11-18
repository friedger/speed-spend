import { cvToString } from '@stacks/transactions';
import React, { useState, useEffect } from 'react';
import { accountsApi, infoApi } from '../lib/constants';
import { hexToCV } from '../lib/transactions';

export function Stacking({ ownerStxAddress }) {
  const [status, setStatus] = useState();
  const [txs, setTxs] = useState();
  const [info, setInfo] = useState();
  useEffect(() => {
    const updatePoxInfo = async () => {
      const poxInfo = await infoApi.getPoxInfo();
      const coreInfo = await infoApi.getCoreApiInfo();
      console.log({ coreInfo, poxInfo });
      setInfo({ coreInfo, poxInfo });
    };
    updatePoxInfo();
    const updatePoxTxs = async () => {
      setStatus('Loading activities');
      const poxTxs = await accountsApi.getAccountTransactions({
        principal: 'ST000000000000000000002AMW42H.pox',
      });
      console.log({ poxTxs });
      setTxs(poxTxs.results.filter(tx => tx.tx_status === 'success'));
      setStatus(null);
    };
    updatePoxTxs();
  }, []);
  return (
    <div>
      <h5>The last successful calls ordered by stacks block height </h5>
      {info && <p>Current burn block height: {info.coreInfo.burn_block_height}</p>}
      {txs &&
        txs.map((poxTx, key) => {
          return <PoxTransaction key={key} poxTx={poxTx} ownerStxAddress={ownerStxAddress} />;
        })}
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}

const cvToData = hex => {
  const tupleCV = hexToCV(hex);
  const data = tupleCV.data;
  console.log(cvToString(tupleCV));
  return {
    stacker: cvToString(data.stacker),
    unlockBurnHeight: data['unlock-burn-height'].value.toString(),
  };
};

const PoxTransaction = ({ poxTx, ownerStxAddress }) => {
  switch (poxTx.tx_type) {
    case 'contract_call':
      switch (poxTx.contract_call.function_name) {
        case 'stack-stx':
          const { stacker, unlockBurnHeight } = cvToData(poxTx.tx_result.hex);
          const startBurnHeight = hexToCV(
            poxTx.contract_call.function_args[2].hex
          ).value.toString();
          return (
            <div className="mb-4">
              {poxTx.block_height}: {poxTx.contract_call.function_name}: {stacker} from burn block{' '}
              {startBurnHeight} until {unlockBurnHeight}
            </div>
          );
        default:
          return (
            <div className="mb-4">
              {poxTx.block_height}: {poxTx.contract_call.function_name}
            </div>
          );
      }
    case 'smart_contract':
      return (
        <div className="mb-4">
          {poxTx.block_height}: PoX started at {poxTx.burn_block_time_iso}
        </div>
      );
    default:
      return (
        <div className="mb-4">
          {poxTx.block_height}: {poxTx.tx_type}
        </div>
      );
  }
};
