import React from 'react';

export default function Overview(props) {
  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5 mb-3">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Overview</h1>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          This site allows you experience the Stacks testnet with your own username. It helps to
          understand the difference aspects of the Stacks technology.
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/tokens">Tokens</a> section is all about Stacks tokens (STX) and other fungible
          tokens. It explains the difference between your own stx address and your app stx address.
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/nfts">NFTs</a> section explains how to use, sell and explore non-fungible
          tokens.
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/contracts">Contracts</a> section is about contract calls and how to protect your
          digital assets when interacting with smart contracts.
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/me">Profile</a> allows you see your current balances.
        </div>
      </div>
    </main>
  );
}
