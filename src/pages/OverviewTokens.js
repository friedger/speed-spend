import React from 'react';

export default function OverviewTokens(props) {
  return (
    <main className="panel-welcome mt-5 container">
      <div className="lead row mt-5 mb-3">
        <div className="col-xs-10 col-md-8 mx-auto px-4">
          <h1 className="card-title">Tokens</h1>
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
      </div>
    </main>
  );
}
