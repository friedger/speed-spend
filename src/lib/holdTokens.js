import { deserializeCV, serializeCV, standardPrincipalCV } from '@blockstack/stacks-transactions';
import { CONTRACT_ADDRESS, HODL_TOKEN_CONTRACT, NETWORK } from './constants';

export function fetchHodlTokenBalance(sender) {
  console.log(sender);
  return fetch(
    `${NETWORK.coreApiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${HODL_TOKEN_CONTRACT}/hodl-balance-of`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `{"sender":"${sender}","arguments":["0x${serializeCV(
        new standardPrincipalCV(sender)
      ).toString('hex')}"]}`,
    }
  )
    .then(async response => {
      return response.json();
    })
    .then(hodlBalanceOf => {
      console.log({ hodlBalanceOf });
      if (hodlBalanceOf.okay) {
        const cv = deserializeCV(Buffer.from(hodlBalanceOf.result.substr(2), 'hex'));
        console.log(cv);
        if (cv.value) {
          return cv.value.toString(10);
        } else {
          return undefined;
        }
      }
    });
}

export function fetchSpendableTokenBalance(sender) {
  return fetch(
    `${NETWORK.coreApiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/${HODL_TOKEN_CONTRACT}/spendable-balance-of`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `{"sender":"${sender}","arguments":["0x${serializeCV(
        new standardPrincipalCV(sender)
      ).toString('hex')}"]}`,
    }
  )
    .then(response => response.json())
    .then(hodlBalanceOf => {
      console.log({ hodlBalanceOf });
      if (hodlBalanceOf.okay) {
        const cv = deserializeCV(Buffer.from(hodlBalanceOf.result.substr(2), 'hex'));
        if (cv.value) {
          return cv.value.toString(10);
        } else {
          return undefined;
        }
      }
    });
}
