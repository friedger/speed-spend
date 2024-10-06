import { AppConfig, UserSession } from '@stacks/connect';
import { authOrigin } from './lib/constants';

const appConfig = new AppConfig(['store_write', 'publish_data']);

export const userSession = new UserSession({ appConfig });

export const authOptions = {
  authOrigin: authOrigin,
  userSession, // usersession is already in state, provide it here
  redirectTo: '/',
  manifestPath: '/manifest.json',
  appDetails: {
    name: 'Speed Spend',
    icon: 'https://speed-spend.org/speedspend.png',
  },
};
