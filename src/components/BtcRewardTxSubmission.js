import React, { useRef, useState, useEffect } from 'react';

import { blocksApi, CONTRACT_ADDRESS, NETWORK, POOL_AUDIT_CONTRACT_NAME } from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect as useStacksJsConnect } from '@stacks/connect-react';
import {
  bufferCV,
  bufferCVFromString,
  callReadOnlyFunction,
  ClarityType,
  cvToString,
  listCV,
  PostConditionMode,
  tupleCV,
  uintCV,
} from '@stacks/transactions';

import SHA256 from 'crypto-js/sha256';
import reverse from 'buffer-reverse';
import MerkleTree from 'merkletreejs';

export function BtcRewardTxSubmission({ ownerStxAddress, userSession }) {
  const { doContractCall } = useStacksJsConnect();
  const heightRef = useRef();
  const txIdRef = useRef();
  const payoutAddress = useRef();
  const lockingPeriod = useRef();

  const spinner = useRef();
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const [loading, setLoading] = useState(false);

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

  const submitAction = async () => {
    setLoading(true);
    const contractAddress = CONTRACT_ADDRESS;
    const contractName = POOL_AUDIT_CONTRACT_NAME;
    const height = parseInt(heightRef.current.value.trim());
    const txId = txIdRef.current.value.trim();
    const tx = await (
      await fetch(`https://api.blockcypher.com/v1/btc/test3/txs/${txId}?limit=50&includeHex=true`)
    ).json();
    console.log(tx.block_hash);
    const block = await (
      await fetch(`https://api.blockcypher.com/v1/btc/test3/blocks/${tx.block_hash}?limit=500`)
    ).json();
    const txIndex = block.txids.findIndex(id => id === txId);
    const stxBlocks = blocksApi.getBlockList({ limit: 100, offset: 0 });

    console.log({ tx, block, txIndex });
    const tree = new MerkleTree(block.txids, SHA256, { isBitcoinTree: true });
    console.log(tree.getProof(txId).map(po => po.data.toString('hex')));
    console.log(tree.getProof(txId).map(po => reverse(po.data).toString('hex')));

    const treeDepth = tree.getDepth();
    console.log({ treeDepth });
    const parts = [
      '00200020',
      'b9d30838796e6ea7ff4b441ca1d705c229f3492cfdddcd186b21000000000000',
      'ed853698ef70b79478b6c01e31efdfff6fac38606661e3aa7b30d1b6fe6bf65a',
      'bec89660',
      '0afd2219',
      '6e2d6012',
    ];
    const blockHeader =
      '00200020b9d30838796e6ea7ff4b441ca1d705c229f3492cfdddcd186b21000000000000ed853698ef70b79478b6c01e31efdfff6fac38606661e3aa7b30d1b6fe6bf65abec896600afd22196e2d6012';
    const blockCV = tupleCV({
      header: bufferCV(Buffer.from(blockHeader, 'hex')),
      height: uintCV(height),
    });
    console.log(SHA256(SHA256(Buffer.from(blockHeader, 'hex'))));
    const txCV = bufferCV(MerkleTree.bufferify(tx.hex));
    const proofCV = tupleCV({
      'tx-index': uintCV(txIndex),
      hashes: listCV(tree.getProof(txId).map(po => bufferCV(reverse(po.data)))),
      'tree-depth': uintCV(treeDepth),
    });

    const functionArgs = [blockCV, txCV, proofCV];
    try {
      setStatus(`Sending transaction`);
      let check = await callReadOnlyFunction({
        contractAddress,
        contractName: 'clarity-bitcoin-v2',
        functionName: 'verify-merkle-proof',
        functionArgs: [
          bufferCV(reverse(MerkleTree.bufferify(txId))),
          bufferCV(reverse(MerkleTree.bufferify(block.mrkl_root))),
          proofCV,
        ],
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('verify-merkle-proof', JSON.stringify(check));

      // was mined?
      check = await callReadOnlyFunction({
        contractAddress,
        contractName: 'clarity-bitcoin-v2',
        functionName: 'was-tx-mined?',
        functionArgs,
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('was-tx-mined', JSON.stringify(check));

      // verify header
      check = await callReadOnlyFunction({
        contractAddress,
        contractName: 'clarity-bitcoin-v2',
        functionName: 'parse-block-header',
        functionArgs: [bufferCV(Buffer.from(blockHeader, 'hex'))],
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('parse', cvToString(check.value.data['merkle-root']));

      // verify header
      check = await callReadOnlyFunction({
        contractAddress,
        contractName: 'clarity-bitcoin-v2',
        functionName: 'verify-block-header',
        functionArgs: [bufferCV(Buffer.from(blockHeader, 'hex')), uintCV(11319)],
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('verify-header', cvToString(check));

      // parse tx
      /*
      check = await callReadOnlyFunction({
        contractAddress,
        contractName: 'clarity-bitcoin-v2',
        functionName: 'parse-tx',
        functionArgs: [txCV],
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('parse-tx', cvToString(check));
      */

      // submit
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'submit-reward-tx',
        functionArgs,
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
        Block Height/Stacks Tip
        <input
          type="number"
          ref={heightRef}
          className="form-control"
          onKeyUp={e => {
            if (e.key === 'Enter') txIdRef.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        Transaction id of bitcoin transaction
        <input
          type="text"
          ref={txIdRef}
          className="form-control"
          onKeyUp={e => {
            if (e.key === 'Enter') lockingPeriod.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        <div className="input-group-append">
          <button className="btn btn-outline-secondary" type="button" onClick={submitAction}>
            <div
              ref={spinner}
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
