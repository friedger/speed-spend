import React, { useRef, useState, useEffect } from 'react';
import { CONTRACT_ADDRESS, NETWORK, POOL_AUDIT_CONTRACT_NAME } from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect as useStacksJsConnect } from '@stacks/connect-react';
import {
  ClarityType,
  cvToString,
  PostConditionMode,
  responseOkCV,
  someCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';

import {
  getPrice,
  getValueForPool,
  paramsFromTx,
  parseBlockHeader,
  verifyBlockHeader,
  verifyMerkleProof,
  wasTxMined,
  wasTxMinedFromHex,
} from '../lib/btcTransactions';

export function BtcRewardTxSubmission({ ownerStxAddress, userSession }) {
  const { doContractCall } = useStacksJsConnect();
  const btcTxIdRef = useRef();

  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [results, setResults] = useState();

  useEffect(() => {
    if (ownerStxAddress) {
      fetchAccount(ownerStxAddress)
        .catch(e => {
          setStatus('Failed to access your account', e);
          console.log(e);
        })
        .then(async acc => {
          setStatus(undefined);
          console.log({ acc });
        });
    }
  }, [ownerStxAddress]);

  const verifyAction = async () => {
    setLoadingVerify(true);
    const btcTxId = btcTxIdRef.current.value.trim();
    const {
      txCV,
      txPartsCV,
      proofCV,
      block,
      blockCV,
      header,
      headerParts,
      headerPartsCV,
      stacksBlock,
    } = await paramsFromTx(btcTxId);
    const height = stacksBlock.height;
    const results = await Promise.all([
      verifyMerkleProof(btcTxId, block, proofCV),
      wasTxMinedFromHex(blockCV, txCV, proofCV),
      parseBlockHeader(header),
      verifyBlockHeader(headerParts, height),
      wasTxMined(headerPartsCV, txCV, proofCV),
      getValueForPool(txPartsCV),
      height
        ? getPrice(height)
        : Promise.resolve(responseOkCV(someCV(tupleCV({ data: uintCV(0) })))),
    ]);
    setResults(results);
    setLoadingVerify(false);
  };

  const submitAction = async () => {
    setLoading(true);
    const contractAddress = CONTRACT_ADDRESS;
    const contractName = POOL_AUDIT_CONTRACT_NAME;

    const btcTxId = btcTxIdRef.current.value.trim();
    const { txPartsCV, proofCV, headerPartsCV } = await paramsFromTx(btcTxId);

    try {
      setStatus(`Sending transaction`);

      // submit
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'report-btc-tx',
        functionArgs: [
          // block
          headerPartsCV,
          // tx
          txPartsCV,
          // proof
          proofCV,
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        userSession,
        network: NETWORK,
        finished: data => {
          console.log(data);
          setStatus(undefined);
          setTxId(data.txId);
          setLoading(false);
        },
      });
    } catch (e) {
      console.log(e);
      setStatus(e.toString());
      setLoading(false);
    }
  };

  return (
    <div>
      <h5>Submit Btc Reward Transaction for Friedger Pool</h5>
      <div className="NoteField">
        Transaction id of bitcoin transaction
        <input
          type="text"
          ref={btcTxIdRef}
          className="form-control"
          defaultValue="7ad9187efd4fa01ce8690015a1a711d7958f18c248fb4c47a32d00732cfc4a61"
          onKeyUp={e => {
            if (e.key === 'Enter') verifyAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={verifyAction}>
            <div
              role="status"
              className={`${
                loadingVerify ? '' : 'd-none'
              } spinner-border spinner-border-sm text-info align-text-top mr-2`}
            />
            Verify
          </button>
        </div>
        {results ? (
          <>
            Tx was mined?:{' '}
            {results[4].type === ClarityType.ResponseOk ? (
              cvToString(results[4].value)
            ) : (
              <>false (error {cvToString(results[4].value)})</>
            )}
            <br />
            Value for Pool: {cvToString(results[5].value.value.data.value)}
          </>
        ) : (
          <>Verify, before submitting!</>
        )}
        <div className="input-group-append">
          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={submitAction}
            disabled={!results || results[4].value.type === ClarityType.BoolFalse}
          >
            <div
              role="status"
              className={`${
                loading ? '' : 'd-none'
              } spinner-border spinner-border-sm text-info align-text-top mr-2`}
            />
            Submit
          </button>
        </div>
      </div>
      <div>
        <TxStatus txId={txId} resultPrefix="You submited the tx " />
      </div>
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
