import { bytesToAscii } from '@stacks/common';
import {
  addressFromPublicKeys,
  AddressHashMode,
  addressToString,
  AddressVersion,
  BufferCV,
  bufferCVFromString,
  callReadOnlyFunction,
  ClarityType,
  createStacksPrivateKey,
  getPublicKey,
  principalCV,
  PrincipalCV,
  ResponseOkCV,
  SomeCV,
  TupleCV,
} from '@stacks/transactions';
import {
  accountsApi,
  BNSV2_CONTRACT_ADDRESS,
  BNSV2_CONTRACT_NAME,
  NETWORK,
  STACKS_API_ACCOUNTS_URL,
} from './constants';

export function getStacksAccount(appPrivateKey: string | Uint8Array) {
  const privateKey = createStacksPrivateKey(appPrivateKey);
  const publicKey = getPublicKey(privateKey);
  const address = addressFromPublicKeys(
    AddressVersion.TestnetSingleSig,
    AddressHashMode.SerializeP2PKH,
    1,
    [publicKey]
  );
  return { privateKey, address };
}

export async function getUserAddress(username: string) {
  const parts = username.split('.');
  if (parts.length === 2) {
    console.log(parts);
    const result = await callReadOnlyFunction({
      contractAddress: BNSV2_CONTRACT_ADDRESS,
      contractName: BNSV2_CONTRACT_NAME,
      functionName: 'get-owner-name',
      functionArgs: [bufferCVFromString(parts[0]), bufferCVFromString(parts[1])],
      network: NETWORK,
      senderAddress: BNSV2_CONTRACT_ADDRESS,
    });
    console.log({ result });
    if (result.type === ClarityType.ResponseOk) {
      return {
        address: addressToString((result as ResponseOkCV<SomeCV<PrincipalCV>>).value.value.address),
      };
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

export async function getUserName(stxAddress: string) {
  if (stxAddress) {
    const result = await callReadOnlyFunction({
      contractAddress: BNSV2_CONTRACT_ADDRESS,
      contractName: BNSV2_CONTRACT_NAME,
      functionName: 'get-primary',
      functionArgs: [principalCV(stxAddress)],
      network: NETWORK,
      senderAddress: BNSV2_CONTRACT_ADDRESS,
    });
    console.log({ result });
    if (result.type === ClarityType.ResponseOk) {
      const nameTuple = result.value as SomeCV<TupleCV<{ name: BufferCV; namespace: BufferCV }>>;
      return {
        name:
          bytesToAscii(nameTuple.value.data.name.buffer) +
          '.' +
          bytesToAscii(nameTuple.value.data.namespace.buffer),
      };
    } else {
      return undefined;
    }
  } else {
    return undefined;
  }
}

/**
 * Uses the AccountsApi of the stacks blockchain api client library,
 * returns the stacks balance object with property `balance` in decimal.
 */
export function fetchAccount(addressAsString: string) {
  console.log(`Checking account "${addressAsString}"`);
  if (addressAsString) {
    return accountsApi
      .getAccountBalance({ principal: addressAsString })
      .then(response => response.stx);
  } else {
    return Promise.reject();
  }
}

/**
 * Uses the RCP api of the stacks node directly,
 * returns the json object with property `balance` in hex.
 */
export function fetchAccount2(addressAsString: string) {
  console.log('Checking account');
  const balanceUrl = `${STACKS_API_ACCOUNTS_URL}/${addressAsString}`;
  return fetch(balanceUrl).then(r => {
    console.log({ r });
    return r.json();
  });
}

export function ellipse(text?: string) {
  if (text && text.length > 12) {
    return `${text.substring(0, 4)}...${text.substring(text.length - 4)}`;
  }
}
