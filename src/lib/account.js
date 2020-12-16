import {
  createStacksPrivateKey,
  getPublicKey,
  addressFromPublicKeys,
  AddressVersion,
  AddressHashMode,
} from '@stacks/transactions';
import { Storage } from '@stacks/storage';
import { STX_JSON_PATH } from '../UserSession';
import { accountsApi, STACKS_API_ACCOUNTS_URL } from './constants';

export function getStacksAccount(appPrivateKey) {
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

export async function getUserAddress(userSession, username) {
  const storage = new Storage({ userSession });
  return storage
    .getFile(STX_JSON_PATH, {
      decrypt: false,
      username: username,
    })
    .then(r => JSON.parse(r))
    .catch(e => console.log(e, username));
}

/**
 * Uses the AccountsApi of the stacks blockchain api client library,
 * returns the stacks balance object with property `balance` in decimal.
 */
export function fetchAccount(addressAsString) {
  console.log(`Checking account "${addressAsString}"`);
  return accountsApi
    .getAccountBalance({ principal: addressAsString })
    .then(response => response.stx);
}

/**
 * Uses the RCP api of the stacks node directly,
 * returns the json object with property `balance` in hex.
 */
export function fetchAccount2(addressAsString) {
  console.log('Checking account');
  const balanceUrl = `${STACKS_API_ACCOUNTS_URL}/${addressAsString}`;
  return fetch(balanceUrl).then(r => {
    console.log({ r });
    return r.json();
  });
}
