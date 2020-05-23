import { AppConfig } from 'blockstack';
import { didConnect } from 'react-blockstack';
import { addressToString } from '@blockstack/stacks-transactions';
import { getStacksAccount } from './StacksAccount';

export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const STX_JSON_PATH = 'stx.json';

function afterSTXAddressPublished() {
  console.log('STX address published');
}

export const connectOptions = session => {
  return {
    finished: ({ userSession }) => {
      didConnect({ userSession });

      const userData = userSession.loadUserData();
      const { address } = getStacksAccount(userData.appPrivateKey);
      console.log(JSON.stringify({ address: addressToString(address) }));
      userSession
        .putFile(
          STX_JSON_PATH,
          JSON.stringify({ address: addressToString(address) }),
          { encrypt: false }
        )
        .then(() => afterSTXAddressPublished())
        .catch(r => {
          console.log(r);
          console.log('STX address NOT published, retrying');
          userSession.deleteFile(STX_JSON_PATH).then(() => {
            userSession
              .putFile(
                STX_JSON_PATH,
                JSON.stringify({ address: addressToString(address) }),
                { encrypt: false }
              )
              .then(() => afterSTXAddressPublished())
              .catch(r => {
                console.log('STX address NOT published');
                console.log(r);
              });
          });
        });
    },
    authOrigin: 'http://localhost:8080',
    appDetails: {
      name: 'Speed Spend',
      icon: 'https://speed-spend.netlify.app/speedspend.png',
    },
    userSession: session,
  };
};
