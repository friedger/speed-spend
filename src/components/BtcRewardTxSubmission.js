import React, { useRef, useState, useEffect } from 'react';

import {
  blocksApi,
  CLARITY_BITCOIN_CONTRACT_NAME,
  CONTRACT_ADDRESS,
  NETWORK,
  POOL_AUDIT_CONTRACT_NAME,
} from '../lib/constants';
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
    const stxBlock = await blocksApi.getBlockByHeight({ height });

    console.log({ txId, tx, block, txIndex });
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
      let check;

      try {
        check = await callReadOnlyFunction({
          contractAddress,
          contractName: CLARITY_BITCOIN_CONTRACT_NAME,
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
      } catch (e) {
        console.log('verify-merkle-proof', e);
      }
      // was mined?
      check = await callReadOnlyFunction({
        contractAddress,
        contractName: CLARITY_BITCOIN_CONTRACT_NAME,
        functionName: 'was-tx-mined?',
        functionArgs,
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('was-tx-mined', JSON.stringify(check));

      // parse block header
      check = await callReadOnlyFunction({
        contractAddress,
        contractName: CLARITY_BITCOIN_CONTRACT_NAME,
        functionName: 'parse-block-header',
        functionArgs: [bufferCV(Buffer.from(blockHeader, 'hex'))],
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('parse block header', cvToString(check.value.data['merkle-root']));

      // verify header
      check = await callReadOnlyFunction({
        contractAddress,
        contractName: CLARITY_BITCOIN_CONTRACT_NAME,
        functionName: 'verify-block-header',
        functionArgs: [
          bufferCV(
            Buffer.from(parts[0] + parts[1] + parts[2] + parts[3] + parts[4] + parts[5], 'hex')
          ),
          uintCV(11319),
        ],
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('verify-header', JSON.stringify(check));

      // parse tx
      try {
        check = await callReadOnlyFunction({
          contractAddress,
          contractName: CLARITY_BITCOIN_CONTRACT_NAME,
          functionName: 'parse-tx',
          functionArgs: [txCV],
          senderAddress: contractAddress,
          network: NETWORK,
        });
        console.log('parse-tx', cvToString(check));
      } catch (e) {
        console.log('parse-tx failed', e.toString());
      }

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

      check = await callReadOnlyFunction({
        contractAddress,
        contractName: CLARITY_BITCOIN_CONTRACT_NAME,
        functionName: 'concat-tx',
        functionArgs: [txPartsCV],
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('concat-tx', cvToString(check));
      console.log('tx', cvToString(txCV));
      console.log(cvToString(txCV) === cvToString(check));
      check = await callReadOnlyFunction({
        contractAddress,
        contractName: CLARITY_BITCOIN_CONTRACT_NAME,
        functionName: 'was-tx-mined-2?',
        functionArgs: [blockPartsCV, txCV, proofCV],
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('was-tx-mined-2?', cvToString(check));

      check = await callReadOnlyFunction({
        contractAddress,
        contractName: contractName,
        functionName: 'get-tx-value-for-pool-2',
        functionArgs: [txPartsCV],
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('get-tx-value-for-pool-2', cvToString(check));


      check = await callReadOnlyFunction({
        contractAddress,
        contractName: contractName,
        functionName: 'oracle-get-price-stx-btc',
        functionArgs: [uintCV(11319)],
        senderAddress: contractAddress,
        network: NETWORK,
      });
      console.log('oracle-get-price-stx-btc', cvToString(check));

      // submit
      await doContractCall({
        contractAddress,
        contractName,
        functionName: 'submit-reward-tx',
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
          defaultValue="7ad9187efd4fa01ce8690015a1a711d7958f18c248fb4c47a32d00732cfc4a61"
          onKeyUp={e => {
            if (e.key === 'Enter') submitAction();
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
