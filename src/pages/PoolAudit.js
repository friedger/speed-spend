import React from 'react';
import { BtcRewardTxSubmission } from '../components/BtcRewardTxSubmission';
import { BtcTxList } from '../components/BtcTxList';
export default function PoolAudit() {
  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Pool Audit</h1>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <BtcRewardTxSubmission />
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-4 px-4">
          <BtcTxList />
        </div>
      </div>
    </main>
  );
}
