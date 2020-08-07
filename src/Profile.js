import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useBlockstack } from 'react-blockstack';
import { fetchAccount, fetchHodlTokenBalance } from './StacksAccount';

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
      <div className="text-center mt-2">
        Hello,{' '}
        <span id="heading-name">{(person && person.name()) || username || 'Stacks Tester'}</span>!
      </div>
      {username && (
        <>
          Your Blockstack username is {username} <br />
        </>
      )}
      <div className="pt-4">
        Your Hodl amount for Speed Spend app:
        <br />
        <StxProfile
          stxAddress={stxAddresses.appStxAddress}
          updateStatus={updateStatus}
        ></StxProfile>
      </div>
      <div className="pt-4">
        Your Hodl amount for Speed Spend Hodl tokens:
        <br />
        <HodlTokenProfile
          stxAddress={stxAddresses.ownerStxAddress}
          updateStatus={updateStatus}
        ></HodlTokenProfile>
      </div>

      <div className="pt-4">
        Your own Stacks address:
        <br />
        <StxProfile
          stxAddress={stxAddresses.ownerStxAddress}
          updateStatus={updateStatus}
          showAddress
        ></StxProfile>
      </div>
      {status && (
        <>
          <br />
          <div>{status}</div>
        </>
      )}
    </div>
  );
}

function HodlTokenProfile({ stxAddress }) {
  const [balanceProfile, setBalanceProfile] = useState({
    balance: undefined,
  });

  useEffect(() => {
    fetchHodlTokenBalance(stxAddress).then(balance => {
      setBalanceProfile({ balance });
    });
  }, [stxAddress]);

  return (
    <>
      {balanceProfile.balance && (
        <>
          {balanceProfile.balance} <br />
        </>
      )}
      {!balanceProfile.balance && (
        <>
          0 <br />
        </>
      )}
    </>
  );
}

function StxProfile({ stxAddress, updateStatus, showAddress }) {
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

  useEffect(() => {
    fetchAccount(stxAddress).then(acc => {
      setProfileState({ account: acc });
    });
  }, [stxAddress]);

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
      {stxAddress && showAddress && (
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
      </button>
      {showAddress && (
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
      )}
    </>
  );
}
