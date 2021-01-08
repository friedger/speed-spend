import React from 'react';

export default function OverviewContracts(props) {
  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5 mb-3">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Contracts</h1>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/jackpot">Flip Coin with Jackpot</a> allows you to play the gambling game "Flip a
          coin". If you bet on the correct value you can win the jackpot.
          <br />
          <i>
            It helps to understand how to create and interact with a smart contract and how to get
            values from read-only contract functions.
          </i>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/at-two">Flip Coin At Two</a> allows you to play the gambling game "Flip a coin".
          You are playing against somebody else, the prize is the stx bid by the other user.
          <br />
          <i>It helps to understand how to create and interact with a smart contract.</i>
        </div>
      </div>
    </main>
  );
}
