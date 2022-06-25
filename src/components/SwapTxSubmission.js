import React, { useRef, useState } from 'react';
import { BTC_STX_SWAP_CONTRACT, NETWORK } from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { useConnect as useStacksJsConnect } from '@stacks/connect-react';
import {
  ClarityType,
  cvToString,
  FungibleConditionCode,
  makeContractSTXPostCondition,
  PostConditionMode,
  uintCV,
} from '@stacks/transactions';

import {
  paramsFromTx,
  parseBlockHeader,
  verifyBlockHeader,
  verifyMerkleProof,
  wasTxMined,
  wasTxMinedFromHex,
} from '../lib/btcTransactions';
import BN from 'bn.js';

export function SwapTxSubmission({ ownerStxAddress, userSession }) {
  const { doContractCall } = useStacksJsConnect();
  const btcTxIdRef = useRef();
  const idRef = useRef();
  const heightRef = useRef();

  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [results, setResults] = useState();

  const verifyAction = async () => {
    setLoadingVerify(true);
    const btcTxId = btcTxIdRef.current.value.trim();
    const stxHeight = parseInt(heightRef.current.value.trim());
    const {
      txCV,
      // txPartsCV,
      proofCV,
      block,
      blockCV,
      header,
      headerParts,
      headerPartsCV,
      stacksBlock,
    } = await paramsFromTx(btcTxId, stxHeight);
    const height = stacksBlock.height;
    const results = await Promise.all([
      verifyMerkleProof(btcTxId, block, proofCV),
      wasTxMinedFromHex(blockCV, txCV, proofCV),
      parseBlockHeader(header),
      verifyBlockHeader(headerParts, height),
      wasTxMined(headerPartsCV, txCV, proofCV),
    ]);
    setResults(results);
    setLoadingVerify(false);
  };

  const submitAction = async () => {
    setLoading(true);
    const contractAddress = BTC_STX_SWAP_CONTRACT.address;
    const contractName = BTC_STX_SWAP_CONTRACT.name;

    const height = parseInt(heightRef.current.value.trim());
    const id = parseInt(idRef.current.value.trim());
    const btcTxId = btcTxIdRef.current.value.trim();
    const { txPartsCV, proofCV, headerPartsCV } = await paramsFromTx(btcTxId, height);
    const idCV = uintCV(id);
    try {
      setStatus(`Sending transaction`);
      // submit
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'submit-swap',
        functionArgs: [
          idCV,
          // block
          headerPartsCV,
          // tx
          txPartsCV,
          // proof
          proofCV,
        ],
        postConditionMode: PostConditionMode.Allow,
        postConditions: [
          makeContractSTXPostCondition(
            BTC_STX_SWAP_CONTRACT.address,
            BTC_STX_SWAP_CONTRACT.name,
            FungibleConditionCode.GreaterEqual,
            new BN(0)
          ),
        ],
        userSession,
        network: NETWORK,
        onFinish: data => {
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
      <h5>Submit Btc Transaction for Swap</h5>
      <div className="NoteField">
        Transaction id of bitcoin transaction
        <input
          type="text"
          ref={btcTxIdRef}
          className="form-control"
          defaultValue="ac9079993724231023e94652e0417413952130b03158c05dff8501321f03ac4e"
          onKeyUp={e => {
            if (e.key === 'Enter') verifyAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        At which Stacks block?
        <input
          type="number"
          ref={heightRef}
          className="form-control"
          defaultValue="17215"
          onKeyUp={e => {
            if (e.key === 'Enter') verifyAction();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        For which swap?
        <input
          type="number"
          ref={idRef}
          className="form-control"
          defaultValue="0"
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
