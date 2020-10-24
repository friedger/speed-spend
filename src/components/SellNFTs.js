import React, { useRef, useState, useEffect } from 'react';

import { CONTRACT_ADDRESS, NETWORK } from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect } from '@blockstack/connect';
import { contractPrincipalCV, PostConditionMode, uintCV } from '@blockstack/stacks-transactions';

export function SellNFTs({ ownerStxAddress }) {
  const { doContractCall } = useConnect();
  const textfieldContractId = useRef();
  const textfieldNFTId = useRef();
  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();

  useEffect(() => {
    fetchAccount(ownerStxAddress)
      .catch(e => {
        setStatus('Failed to access your account', e);
        console.log(e);
      })
      .then(async acc => {
        console.log({ acc });
      });
  }, [ownerStxAddress]);

  const sellAction = async () => {
    spinner.current.classList.remove('d-none');

    var contractId = textfieldContractId.current.value.trim();
    var [nftAddress, nftName] = contractId.split('.');
    var nftId = textfieldNFTId.current.value.trim();

    try {
      setStatus(`Sending transaction`);

      await doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'market',
        functionName: 'offer-tradable',
        functionArgs: [
          contractPrincipalCV(nftAddress, nftName),
          uintCV(parseInt(nftId)),
          uintCV(1000),
          uintCV(7),
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        network: NETWORK,
        finished: data => {
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
      <h5>Put an NFT on sale for 1000 uSTX for 7 days</h5>
      <div className="NoteField input-group ">
        <input
          type="text"
          ref={textfieldContractId}
          className="form-control"
          placeholder="ID of NFT Contract (ST1234.monsters)"
          onBlur={e => {
            setStatus(undefined);
          }}
        />
      </div>
      <div className="NoteField input-group ">
        <input
          type="text"
          ref={textfieldNFTId}
          className="form-control"
          placeholder="ID of NFT"
          onKeyUp={e => {
            if (e.key === 'Enter') sellAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={sellAction}>
            <div
              ref={spinner}
              role="status"
              className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
            />
            Sell
          </button>
        </div>
      </div>
      <div>
        <TxStatus txId={txId} resultPrefix="NFT put on sale in block " />
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
