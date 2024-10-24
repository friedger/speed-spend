import {
  ClarityType,
  cvToHex,
  cvToString,
  deserializeCV,
  hexToCV,
  OptionalCV,
  PrincipalCV,
  ResponseErrorCV,
  ResponseOkCV,
  tupleCV,
  uintCV,
} from '@stacks/transactions';
import {
  accountsApi,
  CONTRACT_ADDRESS,
  MONSTERS_CONTRACT_NAME,
  smartContractsApi,
} from './constants';

interface Asset {
  event_type: string;
  asset: {
    asset_id: string;
    value: {
      hex: string;
    };
  };
}

export interface MonsterDetails {
  owner: string;
  metaData: {
    image: number;
    lastMeal: number;
    name: string;
    dateOfBirth: number;
  };
  alive: boolean;
}

type TupleCV = {
  type: ClarityType.Tuple;
  data: Record<string, any>;
};

export async function fetchMonsterIds(stxAddress: string) {
  return accountsApi
    .getAccountAssets({ principal: stxAddress })
    .then(assetList => {
      console.log({ assetList });
      return assetList;
    })
    .then(assetList =>
      (assetList.results as Asset[])
        .filter(
          a =>
            a.event_type === 'non_fungible_token_asset' &&
            a.asset.asset_id === `${CONTRACT_ADDRESS}.monsters::nft-monsters`
        )
        .map(a => a.asset.value.hex)
    )
    .then(idsHex => [...new Set(idsHex)]);
}

export async function fetchMonsterDetails(monsterId: number | bigint): Promise<MonsterDetails> {
  console.log({ monsterId });

  // Convert monsterId to BigInt if it's not already
  const monsterIdBigInt = BigInt(monsterId);

  const [owner, metaData, alive] = await Promise.all([
    // Fetch the owner of the monster
    smartContractsApi
      .callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        functionName: 'get-owner',
        readOnlyFunctionArgs: {
          sender: CONTRACT_ADDRESS,
          arguments: [cvToHex(uintCV(monsterIdBigInt))], // Convert to uintCV with BigInt
        },
      })
      .then(response => {
        if (response.result) {
          const resultCV = hexToCV(response.result) as
            | ResponseOkCV<OptionalCV<PrincipalCV>>
            | ResponseErrorCV;
          if (resultCV.type === ClarityType.ResponseOk) {
            console.log(cvToString(resultCV));
            if (resultCV.value.type == ClarityType.OptionalSome) {
              return cvToString(resultCV.value.value);
            }
            throw new Error(`Unexpected result type ${cvToString(resultCV)} for owner.`);
          } else {
            throw new Error('Failed to retrieve owner data: result is undefined');
          }
        }
      }),

    // Fetch monster details from the data map
    smartContractsApi
      .getContractDataMapEntry({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        mapName: MONSTERS_CONTRACT_NAME,
        key: cvToHex(uintCV(monsterIdBigInt)), // Convert to uintCV with BigInt
      })
      .then(dataMap => {
        if (dataMap.data) {
          const metaDataCV = hexToCV(dataMap.data);
          if (metaDataCV.type === ClarityType.OptionalSome) {
            const metaData = (metaDataCV.value as TupleCV).data;
            console.log({ metaData });
            return {
              image: parseInt(metaData['image'].value), // If values can be larger, consider using BigInt as well
              lastMeal: parseInt(metaData['last-meal'].value),
              name: metaData['name'].data,
              dateOfBirth: parseInt(metaData['date-of-birth'].value),
            };
          } else {
            throw new Error(`Unexpected data type ${cvToString(metaDataCV)} for monster metadata.`);
          }
        } else {
          throw new Error('Failed to retrieve monster details: data is undefined');
        }
      }),

    // Check if the monster is alive
    smartContractsApi
      .callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        functionName: 'is-alive',
        readOnlyFunctionArgs: {
          sender: CONTRACT_ADDRESS,
          arguments: [cvToHex(uintCV(monsterIdBigInt))], // Convert to uintCV with BigInt
        },
      })
      .then(response => {
        if (response.result) {
          const responseCV = hexToCV(response.result);
          return responseCV.type === ClarityType.ResponseOk
            ? responseCV.value.type === ClarityType.BoolTrue
            : false;
        } else {
          throw new Error('Failed to retrieve alive status: result is undefined');
        }
      }),
  ]);

  return { owner, metaData, alive };
}
