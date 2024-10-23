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
          const resultCV = deserializeCV(Uint8Array.from(Buffer.from(response.result.substr(2), 'hex')));
          if (resultCV.type === ClarityType.PrincipalStandard) {
            console.log(cvToString(resultCV));
            return cvToString(resultCV);
          } else {
            throw new Error('Unexpected result type for owner.');
          }
        } else {
          throw new Error('Failed to retrieve owner data: result is undefined');
        }
      }),

    // Fetch monster details from the data map
    smartContractsApi
      .getContractDataMapEntry({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        mapName: MONSTERS_CONTRACT_NAME,
        key: cvToHex(tupleCV({ 'monster-id': uintCV(monsterIdBigInt) })), // Convert to uintCV with BigInt
      })
      .then(dataMap => {
        if (dataMap.data) {
          const metaDataCV = deserializeCV(Uint8Array.from(Buffer.from(dataMap.data.substr(2), 'hex')));
          if (metaDataCV.type === ClarityType.Tuple) {
            const metaData = (metaDataCV as TupleCV).data;
            console.log({ metaData });
            return {
              image: parseInt(metaData['image'].value), // If values can be larger, consider using BigInt as well
              lastMeal: parseInt(metaData['last-meal'].value),
              name: metaData['name'].data,
              dateOfBirth: parseInt(metaData['date-of-birth'].value),
            };
          } else {
            throw new Error('Unexpected data type for monster metadata.');
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
          const responseCV = deserializeCV(Uint8Array.from(Buffer.from(response.result.substr(2), 'hex')));
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