import React from 'react';

export default function OverviewPox(props) {
  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5 mb-3">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">PoX</h1>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/pools">Stacking Pools</a> shows you publicly registered pools and let you join a
          pool.
          <br />
          <i>It helps you to understand how to do delegated stacking.</i>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/poxlite">PoX Lite</a> allows you to mint Stinger tokens by committing STX.
          <br />
          <i>It helps to understand how to app chains might work in the future.</i>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/stacking">Stacking</a> shows you a list of recent stacking transactions.
          <br />
          <i>It helps to understand how to what kind of stacking activities happen on testnet.</i>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/pool-audit">Pool Audit</a> shows you a list of bitcoin transactions that have been
          reported as reward tx for Friedger Pool.
          <br />
          <i>It helps to understand the link between bitcoin transactions and stacks transactions.</i>
        </div>
      </div>
    </main>
  );
}
