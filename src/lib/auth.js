import { AppConfig, UserSession } from '@stacks/connect-react';
import { authOrigin } from './constants';

const appConfig = new AppConfig(['store_write', 'publish_data']);
export const session = new UserSession({ appConfig });

export const authOptions = {
  authOrigin: authOrigin,
  onFinish: ({ userSession }) => {
    console.log({ onfinsihedusersession: userSession });
  },
  appDetails: {
    name: 'Speed Spend',
    icon: 'https://speed-spend.org/speedspend.png',
  },
  userSession: session,
};
