import React, { useCallback } from 'react';
import { BlockstackButton } from 'react-blockstack-button';
import { didConnect, useConnectOptions } from 'react-blockstack';
import { showBlockstackConnect } from '@blockstack/connect';
import {
  addressFromPublicKeys,
  AddressVersion,
  AddressHashMode,
  createStacksPublicKey,
  addressToString,
} from '@blockstack/stacks-transactions';
import { getPublicKeyFromPrivate, AppConfig, UserSession } from 'blockstack';

// Landing page demonstrating Blockstack connect for registration

const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession(appConfig);

const connectOptions = {
  finished: ({ userSession }) => {
    didConnect({ userSession });
    const userData = userSession.loadUserData();
    const address = addressFromPublicKeys(
      AddressVersion.TestnetSingleSig,
      AddressHashMode.SerializeP2PKH,
      1,
      [createStacksPublicKey(getPublicKeyFromPrivate(userData.appPrivateKey))]
    );
    console.log(JSON.stringify({ address: addressToString(address) }));
    userSession
      .putFile(
        'stx.json',
        JSON.stringify({ address: addressToString(address) }),
        { encrypt: false }
      )
      .then(r => console.log('STX address published'))
      .catch(r => console.log(r));
  },
  appDetails: {
    name: 'Speed Spend',
    icon: 'https://speed-spend.netlify.app/speedspend.png',
  },
  userSession,
};

export default function Landing(props) {
  const authOptions = useConnectOptions(connectOptions);
  const signIn = useCallback(() => {
    showBlockstackConnect(authOptions);
  }, [authOptions]);
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
              <strong>
                helping everybody quickly test the Stacks Testnet.
              </strong>
            </p>

            <div className="card mt-4 border-info">
              <div className="card-header">
                <h5 className="card-title">About Stacks Testnet (Neon)</h5>
              </div>
              <div className="row">
                <div className="col col-md-12 p-4">
                  <a
                    href="https://testnet.blockstack.org"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Stack Testnet
                  </a>{' '}
                  is blockchain based on Proof of Transfer. The testnet is
                  initiated by Blockstack PBC, a New York based public benefit
                  corporation. In the current phase <i>Neon</i> all nodes
                  validate the network, only one node is mining new blocks and
                  all nodes connect to the same bitcoin regtest node.
                </div>
              </div>
            </div>

            <div className="card mt-4 border-info">
              <div className="card-header">
                <h5 className="card-title">Speed Spend</h5>
              </div>
              <div className="card-body">
                <p className="card-text mb-3 mt-4 mx-5 px-5">
                  Distribute your money as quickly as possible.
                  <br />A STX address is created automatically after login
                  (using your app private key) and published using your Gaia
                  storage. Get some tokens for this address from the faucet and
                  send them as quickly as possible by entering a blockstack
                  username of a friend (that as already published their STX
                  address).
                </p>
              </div>

              <p className="card-link mb-5">
                <BlockstackButton onClick={signIn} />
              </p>

              <div className="card-footer text-info">
                <strong>Help testing the Stacks Testnet.</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
