import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useBlockstack } from 'react-blockstack';
import {
  fetchAccount,
  fetchHodlTokenBalance,
  fetchSpendableTokenBalance,
  TxStatus,
} from '../StacksAccount';

// Demonstrating BlockstackContext for legacy React Class Components.

export default function Profile({ stxAddresses }) {
  const [status, setStatus] = useState('');
  const { person, userData } = useBlockstack();
  const username = userData && userData.username;

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
        Your own Stacks address:
        <br />
        <StxProfile
          stxAddress={stxAddresses.ownerStxAddress}
          updateStatus={updateStatus}
          showAddress
        ></StxProfile>
      </div>
      <div className="pt-4">
        Your STX hodl address for Speed Spend app:
        <br />
        <StxProfile
          stxAddress={stxAddresses.appStxAddress}
          updateStatus={updateStatus}
          showAddress
        ></StxProfile>
      </div>
      <div className="pt-4">
        Your Speed Spend Hodl tokens:
        <br />
        <HodlTokenProfile
          stxAddress={stxAddresses.ownerStxAddress}
          updateStatus={updateStatus}
        ></HodlTokenProfile>
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

function HodlTokenProfile({ stxAddress, updateStatus }) {
  const [hodlBalanceProfile, setHodlBalanceProfile] = useState({
    balance: undefined,
  });

  const [spendableBalanceProfile, setSpendableBalanceProfile] = useState({
    balance: undefined,
  });

  const spinner = useRef();

  useEffect(() => {
    fetchHodlTokenBalance(stxAddress).then(balance => {
      setHodlBalanceProfile({ balance });
    });
    fetchSpendableTokenBalance(stxAddress).then(balance => {
      setSpendableBalanceProfile({ balance });
    });
  }, [stxAddress]);

  const onRefreshBalance = useCallback(
    async stxAddress => {
      updateStatus(undefined);
      spinner.current.classList.remove('d-none');

      fetchHodlTokenBalance(stxAddress)
        .then(balance => {
          setHodlBalanceProfile({ balance });
          spinner.current.classList.add('d-none');
        })
        .catch(e => {
          updateStatus('Refresh failed');
          console.log(e);
          spinner.current.classList.add('d-none');
        });

      fetchSpendableTokenBalance(stxAddress)
        .then(balance => {
          setSpendableBalanceProfile({ balance });
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

  return (
    <>
      Your balance:
      <br />
      {hodlBalanceProfile.balance && <>{hodlBalanceProfile.balance} hodled Hodl Tokens</>}
      {!hodlBalanceProfile.balance && <>0 hodled Hodl Tokens</>}
      <br />
      {spendableBalanceProfile.balance && (
        <>{spendableBalanceProfile.balance} spendable Hodl Tokens</>
      )}
      {!spendableBalanceProfile.balance && <>0 spendable Hodl Tokens</>}
      <br />
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
    </>
  );
}

function StxProfile({ stxAddress, updateStatus, showAddress }) {
  const [txId, setTxId] = useState();
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

  const claimTestTokens = async stxAddr => {
    updateStatus(undefined);
    faucetSpinner.current.classList.remove('d-none');

    fetch(`https://sidecar.staging.blockstack.xyz/sidecar/v1/faucets/stx?address=${stxAddr}`, {
      method: 'POST',
    })
      .then(r => {
        if (r.status === 200) {
          r.json().then(faucetResponse => {
            setTxId(faucetResponse.txId.substr(2));
          });

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
          You balance: {profileState.account.balance}uSTX.
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
        <>
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
          <br />
          <TxStatus txId={txId} resultPrefix="Tokens transferred? " />
        </>
      )}
    </>
  );
}
