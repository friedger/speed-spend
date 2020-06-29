import React, { Component } from 'react';
import BlockstackContext from 'react-blockstack/dist/context';
import { addressToString } from '@blockstack/stacks-transactions';
import { getStacksAccount, STACKS_API_ACCOUNTS_BROWSER_URL, fetchAccount } from './StacksAccount';

// Demonstrating BlockstackContext for legacy React Class Components.

export default class Profile extends Component {
  static contextType = BlockstackContext;

  state = {
    account: undefined,
    address: undefined,
    balanceBrowserUrl: undefined,
    status: undefined,
  };

  constructor(props) {
    super(props);
    this.spinner = React.createRef();
    this.faucetSpinner = React.createRef();
  }

  componentDidMount() {
    this.onContextChanged();
  }

  async onContextChanged() {
    const { userData } = this.context;

    const { address } = getStacksAccount(userData.appPrivateKey);
    const addressAsString = addressToString(address);
    this.setState({
      address,
      balanceBrowserUrl: `${STACKS_API_ACCOUNTS_BROWSER_URL}/${addressAsString}`,
    });
    this.onRefreshBalance(addressAsString);
  }

  onRefreshBalance(addressAsString) {
    this.setState({ status: undefined });
    this.spinner.current.classList.remove('d-none');
    fetchAccount(addressAsString)
      .then(acc => {
        console.log(acc);
        this.setState({ account: acc });
        this.spinner.current.classList.add('d-none');
      })
      .catch(e => {
        this.setStatus('Refresh failed');
        console.log(e);
        this.spinner.current.classList.add('d-none');
      });
  }

  setStatus(status) {
    this.setState({ status });
    setTimeout(() => {
      this.setState({ status: undefined });
    }, 2000);
  }

  claimTestTokens(addressAsString) {
    this.setState({ status: undefined });
    this.faucetSpinner.current.classList.remove('d-none');

    fetch(
      `https://sidecar.staging.blockstack.xyz/sidecar/v1/faucets/stx?address=${addressAsString}`,
      {
        method: 'POST',
      }
    )
      .then(r => {
        if (r.status === 200) {
          this.setStatus('Tokens will arrive soon.');
        } else {
          this.setStatus('Claiming tokens failed.');
        }
        console.log(r);
        this.faucetSpinner.current.classList.add('d-none');
      })
      .catch(e => {
        this.setStatus('Claiming tokens failed.');
        console.log(e);
        this.faucetSpinner.current.classList.add('d-none');
      });
  }

  render() {
    const { person } = this.context;
    const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
    const proxyUrl = url => '/proxy/' + url.replace(/^https?:\/\//i, '');

    const { account, address, status } = this.state;
    return (
      <div className="Profile">
        <div className="avatar-section text-center">
          <img
            src={proxyUrl((person && person.avatarUrl()) || avatarFallbackImage)}
            className="img-rounded avatar"
            id="avatar-image"
            alt="Avatar"
          />
        </div>
        <h1 className="text-center mt-2">
          Hello, <span id="heading-name">{(person && person.name()) || 'Stacks Tester'}</span>!
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
        <button
          className="btn btn-outline-secondary mt-1"
          onClick={e => {
            this.onRefreshBalance(addressToString(address));
          }}
        >
          <div
            ref={this.spinner}
            role="status"
            className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
          />
          Refresh balance
        </button>{' '}
        <button
          className="btn btn-outline-secondary mt-1"
          onClick={() => {
            this.claimTestTokens(addressToString(address));
          }}
        >
          <div
            ref={this.faucetSpinner}
            role="status"
            className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
          />
          Claim test tokens from faucet
        </button>
        {status && (
          <>
            <br />
            <div>{status}</div>
          </>
        )}
      </div>
    );
  }
}
