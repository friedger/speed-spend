import React, { useRef, useState, useCallback } from 'react';
import { useBlockstack } from 'react-blockstack';
import { fetchAccount } from './StacksAccount';

// Demonstrating BlockstackContext for legacy React Class Components.

export default function Profile({ stxAddresses }) {
  const [status, setStatus] = useState('');

  const { person, username } = useBlockstack();

  const updateStatus = status => {
    setStatus(status);
    setTimeout(() => {
      setStatus(undefined);
    }, 2000);
  };

  const avatarFallbackImage = 'https://s3.amazonaws.com/onename/avatar-placeholder.png';
  const proxyUrl = url => '/proxy/' + url.replace(/^https?:\/\//i, '');

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
      {username && (
        <>
          Your Blockstack username is {username} <br />
        </>
      )}
      Your app Stacks address:
      <br />
      <StxProfile stxAddress={stxAddresses.appStxAddress} updateStatus={updateStatus}></StxProfile>
      <br />
      Your own Stacks address:
      <br />
      <StxProfile
        stxAddress={stxAddresses.ownerStxAddress}
        updateStatus={updateStatus}
      ></StxProfile>
      {status && (
        <>
          <br />
          <div>{status}</div>
        </>
      )}
    </div>
  );
}

function StxProfile({ stxAddress, updateStatus }) {
  const spinner = useRef();
  const faucetSpinner = useRef();

  const [profileState, setProfileState] = useState({
    account: undefined,
  });

  const onRefreshBalance = useCallback(
    async stxAddress => {
      updateStatus(undefined);
      spinner.current.classList.remove('d-none');

      fetchAccount(stxAddress)
        .then(acc => {
          console.log(acc);
          setProfileState({ account: acc });
          spinner.current.classList.add('d-none');
        })
        .catch(e => {
          updateStatus('Refresh failed');
          console.log(e);
          spinner.current.classList.add('d-none');
        });
    },
    [updateStatus]
  );

  const claimTestTokens = stxAddr => {
    updateStatus(undefined);
    faucetSpinner.current.classList.remove('d-none');

    fetch(`https://sidecar.staging.blockstack.xyz/sidecar/v1/faucets/stx?address=${stxAddr}`, {
      method: 'POST',
    })
      .then(r => {
        if (r.status === 200) {
          updateStatus('Tokens will arrive soon.');
        } else {
          updateStatus('Claiming tokens failed.');
        }
        console.log(r);
        faucetSpinner.current.classList.add('d-none');
      })
      .catch(e => {
        updateStatus('Claiming tokens failed.');
        console.log(e);
        faucetSpinner.current.classList.add('d-none');
      });
  };

  return (
    <>
      {stxAddress && (
        <>
          {stxAddress} <br />
        </>
      )}
      {profileState.account && (
        <>
          You balance: {parseInt(profileState.account.balance, 16).toString()}uSTX.
          <br />
        </>
      )}
      <button
        className="btn btn-outline-secondary mt-1"
        onClick={e => {
          onRefreshBalance(stxAddress);
        }}
      >
        <div
          ref={spinner}
          role="status"
          className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
        />
        Refresh balance
      </button>{' '}
      <button
        className="btn btn-outline-secondary mt-1"
        onClick={() => {
          claimTestTokens(stxAddress);
        }}
      >
        <div
          ref={faucetSpinner}
          role="status"
          className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
        />
        Claim test tokens from faucet
      </button>
    </>
  );
}
