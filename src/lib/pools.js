import {
  bufferCVFromString,
  callReadOnlyFunction,
  listCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import { NETWORK } from './constants';

const contractAddress = 'ST2ZRX0K27GW0SP3GJCEMHD95TQGJMKB7G9Y0X1MH';
const contractName = 'pool-registry';

export async function fetchPools(offset = 0) {
  const idsCV = [...Array(10).keys()].map(i => uintCV(i + offset));
  const receipt = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-pools',
    functionArgs: [listCV([])],
    network: NETWORK,
  });
  return receipt.value;
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
