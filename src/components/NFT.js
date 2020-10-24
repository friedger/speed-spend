import React, { useState, useEffect } from 'react';

import { hexToCV, TxStatus } from '../lib/transactions';
import { BidNFTs } from './BidNFTs';

export function NFT({ nftId, nftTx, ownerStxAddress }) {
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [nftDetails, setNFTDetails] = useState();

  useEffect(() => {
    if (nftTx) {
      console.log({ nftTx });
      const tradable = nftTx.contract_call.function_args[0].repr;
      const tradableId = hexToCV(nftTx.contract_call.function_args[1].hex).value.toString();
      const owner = nftTx.sender_address;
      setNFTDetails({ tradable, tradableId, owner });
    } else {
      console.log('no NFT id');
    }
  }, [nftTx]);

  return (
    <div style={{ border: '2px solid black', boxSizing: 'border-box', padding: 8 }}>
      {nftDetails ? (
        <>
          <b>{nftDetails.tradable}</b>
          <br />
          <small>ID: {nftDetails.tradableId}</small>
          <br />
          {nftDetails.owner !== ownerStxAddress ? (
            <>
              <small>Owned by: {nftDetails.owner}</small>
              <br />
            </>
          ) : (
            <>
              <small>Owned by you</small>
              <br />
            </>
          )}
          {nftDetails.owner !== ownerStxAddress && (
            <>
              <BidNFTs
                ownerStxAddress={ownerStxAddress}
                tradable={nftDetails.tradable}
                tradableId={nftDetails.tradableId}
              />
              <br />
            </>
          )}
          <TxStatus txId={txId} resultPrefix="" />
        </>
      ) : null}

      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
