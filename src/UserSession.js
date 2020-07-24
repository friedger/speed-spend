import { AppConfig } from 'blockstack';
import { addressToString } from '@blockstack/stacks-transactions';
import { getStacksAccount } from './StacksAccount';
import { didConnect } from 'react-blockstack';

export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const STX_JSON_PATH = 'stx.json';

function afterSTXAddressPublished() {
  console.log('STX address published');
}

export const finished = onDidConnect => ({ userSession }) => {
  didConnect({ userSession });
  onDidConnect({ userSession });
  console.log(userSession.loadUserData());

  const userData = userSession.loadUserData();
  const { address } = getStacksAccount(userData.appPrivateKey);
  console.log(JSON.stringify({ address: addressToString(address) }));
  userSession
    .putFile(STX_JSON_PATH, JSON.stringify({ address: addressToString(address) }), {
      encrypt: false,
    })
    .then(() => afterSTXAddressPublished())
    .catch(r => {
      console.log(r);
      console.log('STX address NOT published, retrying');
      userSession.deleteFile(STX_JSON_PATH).then(() => {
        userSession
          .putFile(STX_JSON_PATH, JSON.stringify({ address: addressToString(address) }), {
            encrypt: false,
          })
          .then(() => afterSTXAddressPublished())
          .catch(r => {
            console.log('STX address NOT published');
            console.log(r);
          });
      });
    });
};

export const connectOptions = onDidConnect => {
  return {
    finished: finished(onDidConnect),
    appDetails: {
      name: 'Speed Spend',
      icon: 'https://speed-spend.netlify.app/speedspend.png',
    },
  };
};
