import React, { Component } from 'react';
import BlockstackContext from 'react-blockstack/dist/context';
import { addressToString } from '@blockstack/stacks-transactions';
import {
  getStacksAccount,
  STACKS_API_ACCOUNTS_URL,
  STACKS_API_ACCOUNTS_BROWSER_URL,
} from './StacksAccount';

// Demonstrating BlockstackContext for legacy React Class Components.

export default class Profile extends Component {
  static contextType = BlockstackContext;
  state = {
    account: undefined,
    address: undefined,
    balanceBrowserUrl: undefined,
  };

  componentDidMount() {
    this.onContextChanged();
  }

  onContextChanged() {
    const { userData } = this.context;

    const { address } = getStacksAccount(userData.appPrivateKey);
    const addressAsString = addressToString(address);
    const balanceUrl = `${STACKS_API_ACCOUNTS_URL}/${addressAsString}`;
    this.setState({
      address,
      balanceBrowserUrl: `${STACKS_API_ACCOUNTS_BROWSER_URL}/${addressAsString}`,
    });
    fetch(balanceUrl)
      .then(r => r.json())
      .then(acc => {
        this.setState({ account: acc });
      });
  }

  render() {
    const { person } = this.context;
    const avatarFallbackImage =
      'https://s3.amazonaws.com/onename/avatar-placeholder.png';
    const proxyUrl = url => '/proxy/' + url.replace(/^https?:\/\//i, '');

    const { account, address, balanceBrowserUrl } = this.state;
    return (
      <div className="Profile">
        <div className="avatar-section text-center">
          <img
            src={proxyUrl(
              (person && person.avatarUrl()) || avatarFallbackImage
            )}
            className="img-rounded avatar"
            id="avatar-image"
            alt="Avatar"
          />
        </div>
        <h1 className="text-center mt-2">
          Hello,{' '}
          <span id="heading-name">
            {(person && person.name()) || 'Stacks Tester'}
          </span>
          !
        </h1>
        {address && (
          <>
            Your STX address: {addressToString(address)} <br />
          </>
        )}
        {account && (
          <>
            You balance: {parseInt(account.balance, 16)}uSTX.
            <br />
          </>
        )}
        <a href={balanceBrowserUrl} target="_blank" rel="noopener noreferrer">
          Check Balance
        </a>
        {' | '}
        <a
          href="https://testnet.blockstack.org/faucet"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit faucet
        </a>
      </div>
    );
  }
}
