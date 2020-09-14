import React from 'react';

export default function Main(props) {
  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5 mb-3">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Overview</h1>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/speed-spend">Speed Spend</a> allows you to send stacks token to other users of
          this app via their blockstack username.
          <br />
          <i>
            It helps to understand the difference between your own stx address and your app stx
            address.
          </i>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/hodl">Hodl</a> allows you to send stacks token between your own stx address and
          your app stx address.
          <br />
          <i>
            It helps to understand the difference between your own stx address and your app stx
            address.
          </i>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/hodl-tokens">Hodl Tokens</a> allows you to buy "Hodl" tokens and stake ("hodl")
          und unstake ("unhodl") them.
          <br />
          <i>
            It helps to understand how to create and interact with fungible tokens and the
            underlying native fungible token functions.
          </i>
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
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/monsters">Monsters</a> allows you to create and sell monsters, the first digital
          collectible on the stacks chain.
          <br />
          <i>
            It helps to understand how to create and interact with a non-fungible tokens (NFT) and
            interaction with a marketplace for NFTs.
          </i>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/me">Profile</a> allows you see your current balances.
          <br />
          <i>It helps to understand how to read account balances.</i>
        </div>
      </div>
    </main>
  );
}
