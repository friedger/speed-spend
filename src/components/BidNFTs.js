import React, { useRef, useState, useEffect } from 'react';

import { CONTRACT_ADDRESS, MARKET_CONTRACT_NAME, NETWORK } from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect } from '@stacks/connect-react';
import { contractPrincipalCV, PostConditionMode, uintCV } from '@stacks/transactions';

export function BidNFTs({ ownerStxAddress, tradable, tradableId }) {
  const { doContractCall } = useConnect();
  const textfieldContractId = useRef();
  const textfieldNFTId = useRef();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();

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
    }
  }, [ownerStxAddress]);

  const bidAction = async () => {
    spinner.current.classList.remove('d-none');

    var contractId = textfieldContractId.current.value.trim();
    var [nftAddress, nftName] = contractId.split('.');
    var nftId = textfieldNFTId.current.value.trim();

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MARKET_CONTRACT_NAME,
        functionName: 'bid',
        functionArgs: [
          contractPrincipalCV(nftAddress, nftName),
          uintCV(parseInt(nftId)),
          uintCV(1000),
        ],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [],
        network: NETWORK,
        onFinish: data => {
          console.log(data);
          setStatus(undefined);
          setTxId(data.txId);
          spinner.current.classList.add('d-none');
        },
      });
    } catch (e) {
      console.log(e);
      setStatus(e.toString());
      spinner.current.classList.add('d-none');
    }
  };

  return (
    <div>
      {tradableId ? <h5>Bid for this NFT for 1000 uSTX</h5> : <h5>Bid for an NFT for 1000 uSTX</h5>}
      <div className="NoteField input-group ">
        <input
          type="text"
          ref={textfieldContractId}
          defaultValue={tradable}
          className="form-control"
          placeholder="ID of contract (e.g. ST1245....monsters)"
          onBlur={e => {
            setStatus(undefined);
          }}
        />
      </div>
      <div className="NoteField input-group ">
        <input
          type="text"
          ref={textfieldNFTId}
          defaultValue={tradableId}
          className="form-control"
          placeholder="ID of NFT"
          onKeyUp={e => {
            if (e.key === 'Enter') bidAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={bidAction}>
            <div
              ref={spinner}
              role="status"
              className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
            />
            Bid
          </button>
        </div>
      </div>
      <div>
        <TxStatus txId={txId} resultPrefix="Offer placed in block " />
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
