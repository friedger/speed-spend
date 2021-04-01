import {
  ClarityType,
  cvToString,
  cvToValue,
  deserializeCV,
  hexToCV,
  standardPrincipalCV,
  uintCV,
} from '@stacks/transactions';
import {
  CONTRACT_ADDRESS,
  ROCKET_FACTORY_CONTRACT_NAME,
  ROCKET_MARKET_CONTRACT_NAME,
  smartContractsApi,
} from './constants';
import { cvToHex } from './transactions';

export function fetchRocketDetails(rocketId) {
  console.log({ monsterId: rocketId });

  return Promise.all([
    smartContractsApi
      .callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: ROCKET_MARKET_CONTRACT_NAME,
        functionName: 'get-owner',
        readOnlyFunctionArgs: {
          sender: CONTRACT_ADDRESS,
          arguments: [cvToHex(uintCV(rocketId))],
        },
      })
      .then(response => {
        const optionalOwnerCV = hexToCV(response.result);
        console.log(optionalOwnerCV, optionalOwnerCV.value.type, optionalOwnerCV.type);
        if (
          optionalOwnerCV.type === ClarityType.ResponseOk &&
          optionalOwnerCV.value.type === ClarityType.OptionalSome
        ) {
          return cvToString(optionalOwnerCV.value.value);
        } else {
          return '';
        }
      }),
    smartContractsApi
      .getContractDataMapEntry({
        contractAddress: CONTRACT_ADDRESS,
        contractName: ROCKET_MARKET_CONTRACT_NAME,
        mapName: 'rockets-details',
        key: cvToHex(uintCV(rocketId)),
      })
      .then(response => cvToValue(hexToCV(response.data))),
  ]).then(result => {
    console.log(result[1]);
    return { owner: result[0], metaData: { size: result[1].value.size.value } };
  });
}

export async function fetchOrderBook(user) {
  const response = await smartContractsApi.getContractDataMapEntry({
    contractAddress: CONTRACT_ADDRESS,
    contractName: ROCKET_FACTORY_CONTRACT_NAME,
    mapName: 'orderbook',
    key: cvToHex(standardPrincipalCV(user)),
  });
  const result = hexToCV(response.data);
  if (result.type === ClarityType.OptionalSome) {
    const order = cvToValue(result.value);
    console.log(order);
    return {
      rocketId: order['rocket-id'].value,
      orderedAtBlock: order['ordered-at-block'].value,
      readyAtBlock: order['ready-at-block'].value,
      balance: order.balance.value,
      size: order.size.value,
    };
  } else {
    return undefined;
  }
}

export async function fetchPilots(rocketId) {
  const response = await smartContractsApi.getContractDataMapEntry({
    contractAddress: CONTRACT_ADDRESS,
    contractName: ROCKET_MARKET_CONTRACT_NAME,
    mapName: 'allowed-pilots',
    key: cvToHex(uintCV(rocketId)),
  });
  const result = hexToCV(response.data);
  if (result.type === ClarityType.OptionalSome) {
    const pilots = result.value.list;
    console.log(pilots);
    return pilots.map(cv => cvToString(cv))
  } else {
    return undefined;
  }
}
