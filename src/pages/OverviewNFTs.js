import React from 'react';

export default function OverviewNFTs(props) {
  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5 mb-3">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">NFTs</h1>
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
          <a href="/rockets">Rockets</a> allows you to order and fly rockets.
          <br />
          <i>
            It helps to understand how to create and interact with a non-fungible tokens (NFT) and
            how to handle user permissions.
          </i>
        </div>
        <div className="col-xs-10 col-md-8 mx-auto mb-3 px-4">
          <a href="/openriff">OpenRiff</a> allows you to sell and trade NFTs.
          <br />
          <i>
            It helps to understand how to spaw assets through an escrow.
          </i>
        </div>
      </div>
    </main>
  );
}
