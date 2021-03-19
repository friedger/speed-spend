import { ClarityType, cvToString, deserializeCV, tupleCV, uintCV } from '@stacks/transactions';
import {
  accountsApi,
  CONTRACT_ADDRESS,
  MONSTERS_CONTRACT_NAME,
  smartContractsApi,
} from './constants';
import { cvToHex, hexToCV } from './transactions';

export async function fetchMonsterIds(ownerStxAddress) {
  return accountsApi
    .getAccountAssets({ principal: ownerStxAddress })
    .then(assetList => {
      console.log({ assetList });
      return assetList;
    })
    .then(assetList =>
      assetList.results
        .filter(
          a =>
            a.event_type === 'non_fungible_token_asset' &&
            a.asset.asset_id === `${CONTRACT_ADDRESS}.monsters::nft-monsters`
        )
        .map(a => a.asset.value.hex)
    )
    .then(idsHex => [...new Set(idsHex)]);
}

export function fetchMonsterDetails(monsterId) {
  console.log({ monsterId });

  return Promise.all([
    smartContractsApi
      .callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        functionName: 'get-owner',
        readOnlyFunctionArgs: {
          sender: CONTRACT_ADDRESS,
          arguments: [cvToHex(uintCV(monsterId))],
        },
      })
      .then(response => {
        console.log(response)
        console.log(cvToString(deserializeCV(Buffer.from(response.result.substr(2), 'hex')).value))
        return cvToString(deserializeCV(Buffer.from(response.result.substr(2), 'hex')).value)
      }
      ),

    smartContractsApi
      .getContractDataMapEntry({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        mapName: 'monsters',
        key: cvToHex(tupleCV({ 'monster-id': uintCV(monsterId) })),
      })
      .then(dataMap => {
        console.log({ dataMap });
        const metaData = deserializeCV(Buffer.from(dataMap.data.substr(2), 'hex')).value.data;
        console.log({ metaData });
        return {
          image: parseInt(metaData['image'].value),
          lastMeal: parseInt(metaData['last-meal'].value),
          name: metaData['name'].data,
          dateOfBirth: parseInt(metaData['date-of-birth'].value),
        };
      }),
    smartContractsApi
      .callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        functionName: 'is-alive',
        readOnlyFunctionArgs: {
          sender: CONTRACT_ADDRESS,
          arguments: [cvToHex(uintCV(monsterId))],
        },
      })
      .then(response => {
        const responseCV = hexToCV(response.result);
        return responseCV.type === ClarityType.ResponseOk
          ? responseCV.value.type === ClarityType.BoolTrue
          : false;
      }),
  ]).then(result => {
    return { owner: result[0], metaData: result[1], alive: result[2] };
  });
}
