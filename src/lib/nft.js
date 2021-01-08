import { cvToString, deserializeCV, tupleCV, uintCV, cvToJSON } from '@stacks/transactions';
import { accountsApi, CONTRACT_ADDRESS, smartContractsApi } from './constants';
import { cvToHex } from './transactions';

export async function fetchNFTIds(ownerStxAddress, nativeNFTType) {
  if (ownerStxAddress) {
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
              a.asset.asset_id === `${CONTRACT_ADDRESS}.${nativeNFTType}`
          )
          .map(a => a.asset.value.hex)
      )
      .then(idsHex => [...new Set(idsHex)]);
  } else {
    return Promise.reject();
  }
}

export function fetchNFTDetails(nftId, contractName, metaDataMapName, nftIdProperty = 'id') {
  console.log({ nftId });

  const nftKey = {};
  nftKey[nftIdProperty] = nftId;
  return Promise.all([
    smartContractsApi
      .callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: contractName,
        functionName: 'owner-of?',
        readOnlyFunctionArgs: {
          sender: CONTRACT_ADDRESS,
          arguments: [cvToHex(uintCV(nftId))],
        },
      })
      .then(response =>
        cvToString(deserializeCV(Buffer.from(response.result.substr(2), 'hex')).value)
      ),

    smartContractsApi
      .getContractDataMapEntry({
        contractAddress: CONTRACT_ADDRESS,
        contractName: contractName,
        mapName: metaDataMapName,
        key: cvToHex(tupleCV(nftKey)),
      })
      .then(dataMap => {
        console.log({ dataMap });
        const metaData = deserializeCV(Buffer.from(dataMap.data.substr(2), 'hex')).value.data;
        console.log({ metaData });
        return cvToJSON(metaData);
      }),
  ]).then(result => {
    return { owner: result[0], metaData: result[1] };
  });
}
