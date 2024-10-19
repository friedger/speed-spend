import { ClarityType, cvToString, deserializeCV, tupleCV, uintCV } from '@stacks/transactions';
import {
  accountsApi,
  CONTRACT_ADDRESS,
  MONSTERS_CONTRACT_NAME,
  smartContractsApi,
} from './constants';
import { cvToHex, hexToCV } from './transactions';

interface Asset {
  event_type: string;
  asset: {
    asset_id: string;
    value: {
      hex: string;
    };
  };
}

interface MonsterMetaData {
  image: number;
  lastMeal: number;
  name: string;
  dateOfBirth: number;
}

interface MonsterDetails {
  owner: string;
  metaData: MonsterMetaData;
  alive: boolean;
}

export async function fetchMonsterIds(ownerStxAddress: string): Promise<string[]> {
  return accountsApi
    .getAccountAssets({ principal: ownerStxAddress })
    .then(assetList => {
      console.log({ assetList });
      return assetList;
    })
    .then(assetList =>
      assetList.results
        .filter(
          (a: Asset) =>
            a.event_type === 'non_fungible_token_asset' &&
            a.asset.asset_id === `ST3FFRX7C911PZP5RHE148YDVDD9JWVS6FZRA60VS.monsters::nft-monsters`
        )
        .map(a => a.asset.value.hex)
    )
    .then(idsHex => [...new Set(idsHex)]);
}

export async function fetchMonsterDetails(monsterId: number): Promise<MonsterDetails> {
  console.log({ monsterId });

  const [owner, metaData, alive] = await Promise.all([
    // Fetch the owner of the monster
    smartContractsApi
      .callReadOnlyFunction({
        contractAddress: 'ST3FFRX7C911PZP5RHE148YDVDD9JWVS6FZRA60VS',
        contractName: 'monsters',
        functionName: 'get-owner',
        readOnlyFunctionArgs: {
          sender:' ST3FFRX7C911PZP5RHE148YDVDD9JWVS6FZRA60VS',
          arguments: [cvToHex(uintCV(monsterId))],
        },
      })
      .then(response => {
        const result = deserializeCV(Buffer.from(response.result.substr(2), 'hex')).value;
        console.log(cvToString(result));
        return cvToString(result);
      }),

    // Fetch monster details from the data map
    smartContractsApi
      .getContractDataMapEntry({
        contractAddress: 'ST3FFRX7C911PZP5RHE148YDVDD9JWVS6FZRA60VS',
        contractName: 'monsters',
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

    // Check if the monster is alive
    smartContractsApi
      .callReadOnlyFunction({
        contractAddress: 'ST3FFRX7C911PZP5RHE148YDVDD9JWVS6FZRA60VS',
        contractName: 'monsters',
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
  ]);

  return { owner, metaData, alive };
}
