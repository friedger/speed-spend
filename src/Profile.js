import React, { Component } from 'react';
import BlockstackContext from 'react-blockstack/dist/context';
import {
  AddressVersion,
  addressFromPublicKeys,
  AddressHashMode,
  addressToString,
  createStacksPublicKey,
} from '@blockstack/stacks-transactions';
import { getPublicKeyFromPrivate } from 'blockstack';

// Demonstrating BlockstackContext for legacy React Class Components.

export default class Profile extends Component {
  static contextType = BlockstackContext;
  render() {
    const { person, userData } = this.context;
    const avatarFallbackImage =
      'https://s3.amazonaws.com/onename/avatar-placeholder.png';
    const proxyUrl = url => '/proxy/' + url.replace(/^https?:\/\//i, '');

    const address = addressFromPublicKeys(
      AddressVersion.TestnetSingleSig,
      AddressHashMode.SerializeP2PKH,
      1,
      [createStacksPublicKey(getPublicKeyFromPrivate(userData.appPrivateKey))]
    );
    const balanceUrl = `http://neon.blockstack.org:20443/v2/accounts/${addressToString(
      address
    )}`;
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
        Your STX address is {addressToString(address)}
        <br />
        <a href={balanceUrl} target="_blank" rel="noopener noreferrer">
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
