import {
  bufferCV,
  callReadOnlyFunction,
  cvToString,
  listCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import MerkleTree from 'merkletreejs';
import reverse from 'buffer-reverse';
import SHA256 from 'crypto-js/sha256';

import {
  accountsApi,
  CLARITY_BITCOIN_CONTRACT_NAME,
  CONTRACT_ADDRESS,
  NETWORK,
  POOL_AUDIT_CONTRACT_NAME,
} from './constants';

export async function fetchBtcTxList() {
  const response = await accountsApi.getAccountTransactions({
    principal: `${CONTRACT_ADDRESS}.${POOL_AUDIT_CONTRACT_NAME}`,
  });

  console.log(response);
  const result = response.results.filter(
    tx =>
      tx.tx_status === 'success' &&
      tx.tx_type === 'contract_call' &&
      tx.contract_call.function_name === 'report-btc-tx'
  );

  console.log(result);
  return result;
}

export async function concatTransaction(txPartsCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CLARITY_BITCOIN_CONTRACT_NAME,
    functionName: 'concat-tx',
    functionArgs: [txPartsCV],
    senderAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  });
  console.log('concat-tx', cvToString(result));
  return result;
}

export async function getTxId(txBuffCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CLARITY_BITCOIN_CONTRACT_NAME,
    functionName: 'get-txid',
    functionArgs: [txBuffCV],
    senderAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  });
  console.log('txid', cvToString(result));
  return result;
}

export async function wasTxMined(blockPartsCV, txCV, proofCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CLARITY_BITCOIN_CONTRACT_NAME,
    functionName: 'was-tx-mined-2?',
    functionArgs: [blockPartsCV, txCV, proofCV],
    senderAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  });
  console.log('was-tx-mined-2?', cvToString(result));
  return result;
}

export async function getValueForPool(txPartsCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: POOL_AUDIT_CONTRACT_NAME,
    functionName: 'get-tx-value-for-pool-2',
    functionArgs: [txPartsCV],
    senderAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  });
  console.log('get-tx-value-for-pool-2', cvToString(result));
  return result;
}

export async function getPrice(blockHeight) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: POOL_AUDIT_CONTRACT_NAME,
    functionName: 'oracle-get-price-stx-btc',
    functionArgs: [uintCV(blockHeight)],
    senderAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  });
  console.log('oracle-get-price-stx-btc', cvToString(result));
  return result;
}

export async function parseTx(txCV) {
  // parse tx
  try {
    const result = await callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: CLARITY_BITCOIN_CONTRACT_NAME,
      functionName: 'parse-tx',
      functionArgs: [txCV],
      senderAddress: CONTRACT_ADDRESS,
      network: NETWORK,
    });
    console.log('parse-tx', cvToString(result));
  } catch (e) {
    console.log('parse-tx failed', e.toString());
  }
}

export async function verifyMerkleProof(txId, block, proofCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CLARITY_BITCOIN_CONTRACT_NAME,
    functionName: 'verify-merkle-proof',
    functionArgs: [
      bufferCV(reverse(MerkleTree.bufferify(txId))),
      bufferCV(reverse(MerkleTree.bufferify(block.mrkl_root))),
      proofCV,
    ],
    senderAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  });
  console.log('verify-merkle-proof', JSON.stringify(result));
  return result;
}

export async function wasTxMinedFromHex(blockCV, txCV, proofCV) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CLARITY_BITCOIN_CONTRACT_NAME,
    functionName: 'was-tx-mined?',
    functionArgs: [blockCV, txCV, proofCV],
    senderAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  });
  console.log('was-tx-mined', JSON.stringify(result));
  return result;
}

export async function parseBlockHeader(blockHeader) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CLARITY_BITCOIN_CONTRACT_NAME,
    functionName: 'parse-block-header',
    functionArgs: [bufferCV(Buffer.from(blockHeader, 'hex'))],
    senderAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  });
  console.log('parse block header', cvToString(result.value.data['merkle-root']));
  return result;
}

export async function verifyBlockHeader(parts, blockHeight) {
  const result = await callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: CLARITY_BITCOIN_CONTRACT_NAME,
    functionName: 'verify-block-header',
    functionArgs: [
      bufferCV(Buffer.from(parts[0] + parts[1] + parts[2] + parts[3] + parts[4] + parts[5], 'hex')),
      uintCV(blockHeight),
    ],
    senderAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  });
  console.log('verify-header', JSON.stringify(result));
  return result;
}


function numberToBuffer(value, size) {
  // increase size by 1 for "too large" numbers
  const buf = Buffer.allocUnsafe(size + 1);
  buf.writeIntLE(value, 0, size + 1);
  // remove the extra byte again
  return buf.slice(0, size);
}

export async function paramsFromTx(height, blockHeader, btcTxId) {
  const tx = await (
    await fetch(`https://api.blockcypher.com/v1/btc/test3/txs/${btcTxId}?limit=50&includeHex=true`)
  ).json();

  // tx hex
  const txCV = bufferCV(MerkleTree.bufferify(tx.hex));

  // tx decomposed
  const txPartsCV = tupleCV({
    version: bufferCV(Buffer.from(tx.hex.substr(0, 8), 'hex')),
    ins: listCV(
      tx.inputs.map(input => {
        console.log(input.sequence.toString(16));
        return tupleCV({
          outpoint: tupleCV({
            hash: bufferCV(reverse(Buffer.from(input.prev_hash, 'hex'))),
            index: bufferCV(numberToBuffer(input.output_index, 4)),
          }),
          scriptSig: bufferCV(Buffer.from(input.script, 'hex')),
          sequence: bufferCV(numberToBuffer(input.sequence, 4)),
        });
      })
    ),
    outs: listCV(
      tx.outputs.map(output =>
        tupleCV({
          scriptPubKey: bufferCV(Buffer.from(output.script, 'hex')),
          value: bufferCV(numberToBuffer(output.value, 8)),
        })
      )
    ),
    locktime: bufferCV(Buffer.from(tx.hex.substr(tx.hex.length - 8), 'hex')),
  });

  const blockResponse = await fetch(`https://api.blockcypher.com/v1/btc/test3/blocks/${tx.block_hash}?limit=500`)
  const block = await blockResponse.json();

  // proof cv
  const txIndex = block.txids.findIndex(id => id === btcTxId);
  const tree = new MerkleTree(block.txids, SHA256, { isBitcoinTree: true });
  const treeDepth = tree.getDepth();
  const proofCV = tupleCV({
    'tx-index': uintCV(txIndex),
    hashes: listCV(tree.getProof(btcTxId).map(po => bufferCV(reverse(po.data)))),
    'tree-depth': uintCV(treeDepth),
  });

  // block header
  const blockCV = tupleCV({
    header: bufferCV(Buffer.from(blockHeader, 'hex')),
    height: uintCV(height),
  });

  // block parts
  const headerParts = [
    blockHeader.substr(0, 8),
    blockHeader.substr(8, 64),
    blockHeader.substr(72, 64),
    blockHeader.substr(136, 8),
    blockHeader.substr(144, 8),
    blockHeader.substr(152, 8),
  ];

  const headerPartsCV = tupleCV({
    version: bufferCV(Buffer.from(headerParts[0], 'hex')),
    parent: bufferCV(Buffer.from(headerParts[1], 'hex')),
    'merkle-root': bufferCV(Buffer.from(headerParts[2], 'hex')),
    timestamp: bufferCV(Buffer.from(headerParts[3], 'hex')),
    nbits: bufferCV(Buffer.from(headerParts[4], 'hex')),
    nonce: bufferCV(Buffer.from(headerParts[5], 'hex')),
    height: uintCV(height),
  });
  return { txCV, txPartsCV, proofCV, block, blockCV, headerParts, headerPartsCV };
}
