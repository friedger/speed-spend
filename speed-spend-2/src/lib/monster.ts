import {
  ClarityType,
  cvToHex,
  cvToString,
  hexToCV,
  OptionalCV,
  PrincipalCV,
  ResponseErrorCV,
  ResponseOkCV,
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
    id: bigint;
  };
  alive: boolean;
}

type TupleCV = {
  type: ClarityType.Tuple;
  data: Record<string, any>;
};



// Fetch Monster IDs associated with a specific address
export async function fetchMonsterIds(stxAddress: string) {
  try {
    const assetList = await accountsApi.getAccountAssets({ principal: stxAddress });
    return [...new Set(
      (assetList.results as Asset[])
        .filter(
          a =>
            a.event_type === 'non_fungible_token_asset' &&
            a.asset.asset_id === `${CONTRACT_ADDRESS}.monsters::nft-monsters`
        )
        .map(a => a.asset.value.hex)
    )];
  } catch (error) {
    console.error(`Error fetching monster IDs for address ${stxAddress}:`, error);
    throw new Error('Failed to fetch monster IDs.');
  }
}

export async function fetchMonsterDetails(monsterId: bigint): Promise<MonsterDetails> {
  try {
    const [owner, metaData, alive] = await Promise.all([
      // Fetch the owner of the monster
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
          if (response.result) {
            const resultCV = hexToCV(response.result) as
              | ResponseOkCV<OptionalCV<PrincipalCV>>
              | ResponseErrorCV;
            if (resultCV.type === ClarityType.ResponseOk && resultCV.value.type == ClarityType.OptionalSome) {
              return cvToString(resultCV.value.value);
            }
          }
          return 'no owner found';
        })
        .catch(error => {
          console.error(`Error fetching owner for monster ID ${monsterId}:`, error);
          return 'unknown owner';
        }),

      // Fetch monster details from the data map
      smartContractsApi
        .getContractDataMapEntry({
          contractAddress: CONTRACT_ADDRESS,
          contractName: MONSTERS_CONTRACT_NAME,
          mapName: MONSTERS_CONTRACT_NAME,
          key: cvToHex(uintCV(monsterId)),
        })
        .then(dataMap => {
          if (dataMap.data) {
            const metaDataCV = hexToCV(dataMap.data);
            if (metaDataCV.type === ClarityType.OptionalSome) {
              const metaData = (metaDataCV.value as TupleCV).data;
              return {
                image: parseInt(metaData['image'].value),
                lastMeal: parseInt(metaData['last-meal'].value),
                name: metaData['name'].data,
                dateOfBirth: parseInt(metaData['date-of-birth'].value),
                id: monsterId,
              };
            }
          }
          throw new Error('Metadata not found for monster.');
        })
        .catch(error => {
          console.error(`Error fetching metadata for monster ID ${monsterId}:`, error);
          return {
            image: 0,
            lastMeal: 0,
            name: 'Unknown',
            dateOfBirth: 0,
            id: monsterId,
          };
        }),

      // Check if the monster is alive
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
          if (response.result) {
            const responseCV = hexToCV(response.result);
            return responseCV.type === ClarityType.ResponseOk && responseCV.value.type === ClarityType.BoolTrue;
          }
          return false;
        })
        .catch(error => {
          console.error(`Error checking alive status for monster ID ${monsterId}:`, error);
          return false;
        }),
    ]);

    return { owner, metaData, alive };
  } catch (error) {
    console.error(`Error fetching details for monster ID ${monsterId}:`, error);
    throw new Error('Failed to fetch monster details.');
  }
}
// Feed Function
export const feed = async (monsterId: bigint) => {
  try {
    const response = await smartContractsApi.callReadOnlyFunction({
      contractAddress: CONTRACT_ADDRESS,
      contractName: MONSTERS_CONTRACT_NAME,
      functionName: 'feed-monster', // Make sure this function exists in your contract
      readOnlyFunctionArgs: {
        sender: CONTRACT_ADDRESS,
        arguments: [cvToHex(uintCV(monsterId))],
      },
    });

    if (response.result) {
      const responseCV = hexToCV(response.result);
      return responseCV.type === ClarityType.ResponseOk;
    } else {
      throw new Error('Failed to feed monster: result is undefined');
    }
  } catch (error) {
    console.error('Error feeding monster:', error);
    return false;
  }
};