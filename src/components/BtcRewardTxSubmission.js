import React, { useRef, useState, useEffect } from 'react';
import SHA256 from 'crypto-js/sha256';
import {
  blocksApi,
  CONTRACT_ADDRESS,
  NETWORK,
  POOL_AUDIT_CONTRACT_NAME,
} from '../lib/constants';
import { TxStatus } from '../lib/transactions';
import { fetchAccount } from '../lib/account';
import { useConnect as useStacksJsConnect } from '@stacks/connect-react';
import {
  bufferCV,
  ClarityType,
  cvToString,
  listCV,
  PostConditionMode,
  tupleCV,
  uintCV,
} from '@stacks/transactions';

import reverse from 'buffer-reverse';
import MerkleTree from 'merkletreejs';
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
  const heightRef = useRef();
  const btcTxIdRef = useRef();
  const blockHeaderRef = useRef();

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
    console.log(
      cvToString(
        tupleCV({
          version: bufferCV(Buffer.from('01000000', 'hex')),
          ins: listCV([
            tupleCV({
              outpoint: tupleCV({
                hash: bufferCV(
                  Buffer.from(
                    'c8bd3502a21f810da7692e323cc46e0e9ec1def7a93cc610f6d65b60193174e2',
                    'hex'
                  )
                ),
                index: bufferCV(Buffer.from('03000000', 'hex')),
              }),
              scriptSig: bufferCV(
                Buffer.from(
                  '47304402204ffe267e6b5aab28350be80c1f4ea94424c483f3f44f175594bb6273000f80e8022042ebd5668420c8b29d2ec2791e2c8aa0d7784d8a6283f958fe581e0be129c61b0121037435c194e9b01b3d7f7a2802d6684a3af68d05bbf4ec8f17021980d777691f1d',
                  'hex'
                )
              ),
              sequence: bufferCV(Buffer.from('fdffffff', 'hex')),
            }),
          ]),
          outs: listCV([
            tupleCV({
              scriptPubKey: bufferCV(
                Buffer.from(
                  '6a4c5058365b13588072c8b4eca88a505db5c453123c5c91db98d90ac1cd124402dba596531ebf945361dbdbcb0a43e8d6984ab8eee14982d0341eab198fc74d2d917c6d95dc001e21c20008001e1fc2001d02',
                  'hex'
                )
              ),
              value: bufferCV(Buffer.from('0000000000000000', 'hex')),
            }),
            tupleCV({
              scriptPubKey: bufferCV(
                Buffer.from('76a914c70e1ca5a5ef633fe5464821ca421c173997f38888ac', 'hex')
              ),
              value: bufferCV(Buffer.from('1027000000000000', 'hex')),
            }),
            tupleCV({
              scriptPubKey: bufferCV(
                Buffer.from('76a9146c575e9f31715b180b22738136895876ade678cb88ac', 'hex')
              ),
              value: bufferCV(Buffer.from('1027000000000000', 'hex')),
            }),
            tupleCV({
              scriptPubKey: bufferCV(
                Buffer.from('76a914ba27f99e007c7f605a8305e318c1abde3cd220ac88ac', 'hex')
              ),
              value: bufferCV(Buffer.from('752f7c5c00000000', 'hex')),
            }),
          ]),
          locktime: bufferCV(Buffer.from('00000000', 'hex')),
        })
      )
    );
    setLoadingVerify(true);
    const height = parseInt(heightRef.current.value.trim());
    const btcTxId = btcTxIdRef.current.value.trim();
    const blockHeader = blockHeaderRef.current.value.trim();
    const { txCV, txPartsCV, proofCV, block, blockCV, headerParts, headerPartsCV } = await paramsFromTx(
      height,
      blockHeader,
      btcTxId
    );
    const results = await Promise.all([
      verifyMerkleProof(btcTxId, block, proofCV),
      wasTxMinedFromHex(blockCV, txCV, proofCV),
      parseBlockHeader(blockHeader),
      verifyBlockHeader(headerParts, height),
      wasTxMined(headerPartsCV, txCV, proofCV),
      getValueForPool(txPartsCV),
      getPrice(height),
    ]);
    setResults(results);
    setLoadingVerify(false);
  };

  const submitAction = async () => {
    setLoading(true);
    const contractAddress = CONTRACT_ADDRESS;
    const contractName = POOL_AUDIT_CONTRACT_NAME;

    const height = parseInt(heightRef.current.value.trim());
    const btcTxId = btcTxIdRef.current.value.trim();
    const blockHeader = blockHeaderRef.current.value.trim();

    const tx = await (
      await fetch(
        `https://api.blockcypher.com/v1/btc/test3/txs/${btcTxId}?limit=50&includeHex=true`
      )
    ).json();
    console.log({ blockHash: tx.block_hash });
    const block = await (
      await fetch(`https://api.blockcypher.com/v1/btc/test3/blocks/${tx.block_hash}?limit=500`)
    ).json();
    const txIndex = block.txids.findIndex(id => id === btcTxId);
    const stxBlock = await blocksApi.getBlockByHeight({ height });

    console.log({ txId, tx, block, txIndex });
    const tree = new MerkleTree(block.txids, SHA256, { isBitcoinTree: true });
    console.log(tree.getProof(btcTxId).map(po => po.data.toString('hex')));
    console.log(tree.getProof(btcTxId).map(po => reverse(po.data).toString('hex')));

    const treeDepth = tree.getDepth();
    console.log({ treeDepth });
    const parts = [
      blockHeader.substr(0, 8),
      blockHeader.substr(8, 64),
      blockHeader.substr(72, 64),
      blockHeader.substr(136, 8),
      blockHeader.substr(144, 8),
      blockHeader.substr(152, 8),
    ];
    const blockCV = tupleCV({
      header: bufferCV(Buffer.from(blockHeader, 'hex')),
      height: uintCV(height),
    });
    console.log(SHA256(SHA256(Buffer.from(blockHeader, 'hex'))));
    const txCV = bufferCV(MerkleTree.bufferify(tx.hex));
    const proofCV = tupleCV({
      'tx-index': uintCV(txIndex),
      hashes: listCV(tree.getProof(btcTxId).map(po => bufferCV(reverse(po.data)))),
      'tree-depth': uintCV(treeDepth),
    });

    try {
      setStatus(`Sending transaction`);

      // check was mined v2
      const blockPartsCV = tupleCV({
        version: bufferCV(Buffer.from(parts[0], 'hex')),
        parent: bufferCV(Buffer.from(parts[1], 'hex')),
        'merkle-root': bufferCV(Buffer.from(parts[2], 'hex')),
        timestamp: bufferCV(Buffer.from(parts[3], 'hex')),
        nbits: bufferCV(Buffer.from(parts[4], 'hex')),
        nonce: bufferCV(Buffer.from(parts[5], 'hex')),
        height: uintCV(height),
      });
      console.log(blockPartsCV.data.nonce.buffer.toString('hex'));

      const txPartsCV = tupleCV({
        version: bufferCV(Buffer.from('01000000', 'hex')),
        ins: listCV([
          tupleCV({
            outpoint: tupleCV({
              hash: bufferCV(
                Buffer.from(
                  'c8bd3502a21f810da7692e323cc46e0e9ec1def7a93cc610f6d65b60193174e2',
                  'hex'
                )
              ),
              index: bufferCV(Buffer.from('03000000', 'hex')),
            }),
            scriptSig: bufferCV(
              Buffer.from(
                '47304402204ffe267e6b5aab28350be80c1f4ea94424c483f3f44f175594bb6273000f80e8022042ebd5668420c8b29d2ec2791e2c8aa0d7784d8a6283f958fe581e0be129c61b0121037435c194e9b01b3d7f7a2802d6684a3af68d05bbf4ec8f17021980d777691f1d',
                'hex'
              )
            ),
            sequence: bufferCV(Buffer.from('fdffffff', 'hex')),
          }),
        ]),
        outs: listCV([
          tupleCV({
            scriptPubKey: bufferCV(
              Buffer.from(
                '6a4c5058365b13588072c8b4eca88a505db5c453123c5c91db98d90ac1cd124402dba596531ebf945361dbdbcb0a43e8d6984ab8eee14982d0341eab198fc74d2d917c6d95dc001e21c20008001e1fc2001d02',
                'hex'
              )
            ),
            value: bufferCV(Buffer.from('0000000000000000', 'hex')),
          }),
          tupleCV({
            scriptPubKey: bufferCV(
              Buffer.from('76a914c70e1ca5a5ef633fe5464821ca421c173997f38888ac', 'hex')
            ),
            value: bufferCV(Buffer.from('1027000000000000', 'hex')),
          }),
          tupleCV({
            scriptPubKey: bufferCV(
              Buffer.from('76a9146c575e9f31715b180b22738136895876ade678cb88ac', 'hex')
            ),
            value: bufferCV(Buffer.from('1027000000000000', 'hex')),
          }),
          tupleCV({
            scriptPubKey: bufferCV(
              Buffer.from('76a914ba27f99e007c7f605a8305e318c1abde3cd220ac88ac', 'hex')
            ),
            value: bufferCV(Buffer.from('752f7c5c00000000', 'hex')),
          }),
        ]),
        locktime: bufferCV(Buffer.from('00000000', 'hex')),
      });

      // submit
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'report-btc-tx',
        functionArgs: [
          // block
          blockPartsCV,
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
        Block Height/Stacks Tip
        <input
          type="number"
          ref={heightRef}
          defaultValue="11319"
          className="form-control"
          onKeyUp={e => {
            if (e.key === 'Enter') blockHeaderRef.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
        Bitcoin Block Header
        <textarea
          type="number"
          ref={blockHeaderRef}
          defaultValue="00200020b9d30838796e6ea7ff4b441ca1d705c229f3492cfdddcd186b21000000000000ed853698ef70b79478b6c01e31efdfff6fac38606661e3aa7b30d1b6fe6bf65abec896600afd22196e2d6012"
          className="form-control"
          onKeyUp={e => {
            if (e.key === 'Enter') btcTxIdRef.current.focus();
          }}
          onBlur={e => {
            setStatus(undefined);
          }}
        />
        <br />
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
            Tx was mined?: {cvToString(results[4].value)}
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
