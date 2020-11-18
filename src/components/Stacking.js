import { cvToString, deserializeCV } from '@stacks/transactions';
import React, { useState, useEffect } from 'react';
import { accountsApi, infoApi } from '../lib/constants';

export function Stacking({ ownerStxAddress }) {
  const [status, setStatus] = useState();
  const [txs, setTxs] = useState();

  useEffect(() => {
    const updatePoxInfo = async () => {
      const result = await infoApi.getPoxInfo();
      console.log({ result });
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
      <h5>The last successful calls ordered by block height</h5>
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
  const tupleCV = deserializeCV(Buffer.from(hex.substr(2), 'hex'));
  const data = tupleCV.data;
  return {
    stacker: cvToString(data.stacker),
    unlockBurnHeight: cvToString(data['unlock-burn-height']),
  };
};

const PoxTransaction = ({ poxTx, ownerStxAddress }) => {
  switch (poxTx.tx_type) {
    case 'contract_call':
      switch (poxTx.contract_call.function_name) {
        case 'stack-stx':
          const { stacker, unlockBurnHeight } = cvToData(poxTx.tx_result.hex);
          return (
            <div className="mb-4">
              {poxTx.block_height}: {poxTx.contract_call.function_name}: {stacker} until block{' '}
              {unlockBurnHeight}
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
