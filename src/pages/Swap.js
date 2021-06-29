import { useAtomValue } from 'jotai/utils';
import React from 'react';
import { SwapCreate } from '../components/SwapCreate';
import { SwapTxList } from '../components/SwapTxList';
import { SwapTxSubmission } from '../components/SwapTxSubmission';
import { useStxAddresses } from '../lib/hooks';

export default function Swap({userSession}) {
  const session = useAtomValue(userSession)
  const { ownerStxAddress } = useStxAddresses(session);

  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Swap</h1>
          Swap Bitcoin and Stacks trustlessly
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <SwapCreate ownerStxAddress={ownerStxAddress}/>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <SwapTxSubmission />
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <SwapTxList />
        </div>
      </div>
    </main>
  );
}
