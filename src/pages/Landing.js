import React from 'react';
import { useConnect } from '@stacks/connect-react';

// Landing page demonstrating Blockstack connect for registration

export default function Landing(props) {
  const { doOpenAuth } = useConnect();

  return (
    <div className="Landing">
      <div className="jumbotron jumbotron-fluid pt-3 mb-0">
        <div className="container">
          <div className="panel-landing text-center mt-3">
            <h1 className="landing-heading">Speed Spend</h1>
            <p className="lead">A simple app to test the Stacks Testnet</p>

            <p className="alert alert-info  border-info">
              Speed Spend is an{' '}
              <a
                href="https://github.com/friedger/starter-app"
                target="_blank"
                rel="noopener noreferrer"
              >
                open source
              </a>{' '}
              web app with the purpose of{' '}
              <strong>helping everybody quickly test the Stacks Testnet.</strong>
            </p>

            <div className="card mt-4 border-info">
              <div className="card-header">
                <h5 className="card-title">About Stacks Testnet (Xenon)</h5>
              </div>
              <div className="row">
                <div className="col col-md-12 p-4">
                  <a
                    href="https://testnet.blockstack.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Stacks Testnet
                  </a>{' '}
                  is blockchain based on Proof of Transfer. The testnet is initiated by Blockstack
                  PBC, a New York based public benefit corporation. In the current phase{' '}
                  <i>Xenon</i> all nodes validate the network, they can mine new blocks, and they
                  connect to the public bitcoin testnet.
                </div>
              </div>
            </div>

            <div className="card mt-4 border-info">
              <div className="card-header">
                <h5 className="card-title">Speed Spend</h5>
              </div>
              <div className="card-body">
                <p className="card-text mb-3">
                  Distribute your money as quickly as possible.
                  <br />A STX address is created automatically after login (using your app private
                  key) and published using your Gaia storage. Get some tokens for this address from
                  the faucet and send them as quickly as possible by entering a blockstack username
                  of a friend (who has already published the STX address).
                </p>
              </div>

              <p className="card-link mb-5">
                <button className="btn btn-outline-primary" type="button" onClick={doOpenAuth}>
                  Start now
                </button>
              </p>

              <div className="card-footer text-info">
                <strong>Help testing the Stacks Testnet!</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
