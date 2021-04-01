import React, { useRef, useState, useEffect } from 'react';

import { fetchAccount } from '../lib/account';

import { fetchNFTs } from '../lib/market';
import { NFT } from './NFT';

export function NFTsOnSale({ ownerStxAddress }) {
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [nfts, setNfts] = useState();

  useEffect(() => {
    if (ownerStxAddress) {
      fetchAccount(ownerStxAddress)
        .catch(e => {
          setStatus('Failed to access your account', e);
          console.log(e);
        })
        .then(async acc => {
          console.log({ acc });
        });
      fetchNFTs(ownerStxAddress)
        .then(async nfts => {
          console.log(nfts);
          setNfts(nfts);
        })
        .catch(e => {
          setStatus('Failed to get balances of your account', e);
          console.log(e);
        });
    }
  }, [ownerStxAddress]);
  console.log({ nfts });
  return (
    <div>
      <h5>NFTs on Sale</h5>
      <div
        ref={spinner}
        role="status"
        className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
      />
      {nfts &&
        nfts.map((nftTx, key) => {
          return <NFT key={key} nftTx={nftTx} ownerStxAddress={ownerStxAddress} />;
        })}
      {!nfts && <>No NFTs on sale. Create onea and sell it here!</>}
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
