import { AppConfig, getPublicKeyFromPrivate } from 'blockstack';
import { didConnect } from 'react-blockstack';
import {
  addressFromPublicKeys,
  AddressVersion,
  AddressHashMode,
  createStacksPublicKey,
  addressToString,
} from '@blockstack/stacks-transactions';

export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const connectOptions = session => {
  return {
    finished: ({ userSession }) => {
      didConnect({ userSession });
      const userData = userSession.loadUserData();
      const address = addressFromPublicKeys(
        AddressVersion.TestnetSingleSig,
        AddressHashMode.SerializeP2PKH,
        1,
        [createStacksPublicKey(getPublicKeyFromPrivate(userData.appPrivateKey))]
      );
      console.log(JSON.stringify({ address: addressToString(address) }));
      userSession
        .putFile(
          'stx.json',
          JSON.stringify({ address: addressToString(address) }),
          { encrypt: false }
        )
        .then(r => console.log('STX address published'))
        .catch(r => {
          console.log('STX address NOT published, retrying');
          console.log(r);
          userSession.deleteFile('stx.json').then(() => {
            userSession
              .putFile(
                'stx.json',
                JSON.stringify({ address: addressToString(address) }),
                { encrypt: false }
              )
              .then(r => console.log('STX address published'))
              .catch(r => {
                console.log('STX address NOT published');
                console.log(r);
              });
          });
        });
    },
    appDetails: {
      name: 'Speed Spend',
      icon: 'https://speed-spend.netlify.app/speedspend.png',
    },
    userSession: session,
  };
};
