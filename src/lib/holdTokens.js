import {
  callReadOnlyFunction,
  ClarityType,
  deserializeCV,
  serializeCV,
  standardPrincipalCV,
} from '@stacks/transactions';
import { CONTRACT_ADDRESS, HODL_TOKEN_CONTRACT, NETWORK } from './constants';

export function fetchHodlTokenBalance(sender) {
  console.log({ sender, cv: standardPrincipalCV(sender) });
  return callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: HODL_TOKEN_CONTRACT,
    functionName: 'get-hodl-balance',
    functionArgs: [standardPrincipalCV(sender)],
    senderAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  }).then(hodlBalanceOf => {
    console.log({ hodlBalanceOf });
    if (hodlBalanceOf.type === ClarityType.ResponseOk) {
      return hodlBalanceOf.value.value.toString(10);
    } else {
      return undefined;
    }
  });
}

export function fetchSpendableTokenBalance(sender) {
  return callReadOnlyFunction({
    contractAddress: CONTRACT_ADDRESS,
    contractName: HODL_TOKEN_CONTRACT,
    functionName: 'get-spendable-balance',
    functionArgs: [standardPrincipalCV(sender)],
    senderAddress: CONTRACT_ADDRESS,
    network: NETWORK,
  }).then(hodlBalanceOf => {
    console.log({ hodlBalanceOf });
    if (hodlBalanceOf.type === ClarityType.ResponseOk) {
      return hodlBalanceOf.value.value.toString(10);
    } else {
      return undefined;
    }
  });
}
