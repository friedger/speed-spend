import {
  createStacksPrivateKey,
  getPublicKey,
  addressFromPublicKeys,
  AddressVersion,
  AddressHashMode,
} from '@blockstack/stacks-transactions';
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
  return userSession
    .getFile(STX_JSON_PATH, {
      decrypt: false,
      username: username,
    })
    .then(r => JSON.parse(r))
    .catch(e => console.log(e, username));
}

export function fetchAccount(addressAsString) {
  console.log('Checking account');
  return accountsApi
    .getAccountBalance({ principal: addressAsString })
    .then(response => response.stx);
}

export function fetchAccount2(addressAsString) {
  console.log('Checking account');
  const balanceUrl = `${STACKS_API_ACCOUNTS_URL}/${addressAsString}`;
  return fetch(balanceUrl).then(r => {
    console.log({ r });
    return r.json();
  });
}

export function fetchBalances(addressAsString) {
  console.log('Checking balances');
  return accountsApi.getAccountBalance({ principal: addressAsString }).then(balance => {
    console.log({ balance });
    return balance;
  });
}
