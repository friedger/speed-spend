import {
  cvToString,
  deserializeCV,
  serializeCV,
  tupleCV,
  uintCV,
} from '@blockstack/stacks-transactions';
import { CONTRACT_ADDRESS, MONSTERS_CONTRACT_NAME, smartContractsApi } from './constants';

export function fetchMonsterDetails2(monsterId) {
  console.log(monsterId);
  return fetch(
    `https://stacks-node-api-latest.argon.blockstack.xyz/v2/map_entry/${CONTRACT_ADDRESS}/${MONSTERS_CONTRACT_NAME}/monsters`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `"0x${monsterId}"`,
    }
  ).then(response => response.json());
}

export function fetchMonsterDetails(monsterId) {
  console.log({ monsterId });

  return Promise.all([
    smartContractsApi
      .callReadOnlyFunction({
        stacksAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        functionName: 'owner-of?',
        readOnlyFunctionArgs: {
          sender: CONTRACT_ADDRESS,
          arguments: [serializeCV(uintCV(monsterId)).toString('hex')],
        },
      })
      .then(response =>
        cvToString(deserializeCV(Buffer.from(response.result.substr(2), 'hex')).value)
      ),
    smartContractsApi
      .getContractDataMapEntryRaw({
        stacksAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        mapName: 'monsters',
        key: serializeCV(tupleCV({ 'monster-id': uintCV(monsterId) })).toString('hex'),
      })
      .then(dataMapRaw => dataMapRaw.raw.json())
      .then(dataMap => {
        console.log({ dataMap });
        const metaData = deserializeCV(Buffer.from(dataMap.data.substr(2), 'hex')).value.data;
        return {
          lastMeal: parseInt(metaData['last-meal'].value),
          name: metaData['name'].buffer.toString(),
        };
      }),
  ]).then(result => {
    return { owner: result[0], metaData: result[1] };
  });
}
