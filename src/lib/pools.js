import {
  bufferCVFromString,
  callReadOnlyFunction,
  ClarityType,
  listCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, NETWORK, POOL_REGISTRY_CONTRACT_NAME } from './constants';

const contractAddress = CONTRACT_ADDRESS;
const contractName = POOL_REGISTRY_CONTRACT_NAME;

export async function fetchPool(poolId) {
  const receipt = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-pool',
    functionArgs: [uintCV(poolId)],
    network: NETWORK,
    senderAddress: contractAddress,
  });
  console.log(receipt);
  if (receipt.type === ClarityType.OptionalNone) {
    return undefined;
  } else {
    return receipt.value;
  }
}

export async function fetchPools(offset = 0) {
  const idsCV = [...Array(10).keys()].map(i => uintCV(i + 1 + offset));
  const receipt = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-pools',
    functionArgs: [listCV(idsCV)],
    network: NETWORK,
    senderAddress: contractAddress,
  });
  console.log(receipt.list);
  return receipt.list.reduce((result, cv) => {
    if (cv.type === ClarityType.OptionalNone) return result;
    else {
      result.push(cv.value);
      return result;
    }
  }, []);
}

export function nameToUsernameCV(fullQualifiedName) {
  const parts = fullQualifiedName.split('.');
  if ((parts.length = 2)) {
    const [name, namespace] = parts;
    console.log(parts);
    return tupleCV({ name: bufferCVFromString(name), namespace: bufferCVFromString(namespace) });
  } else {
    return undefined;
  }
}
