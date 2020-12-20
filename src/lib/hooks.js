import { getUserData, useConnect } from '@stacks/connect-react';
import { addressToString } from '@stacks/transactions';

import { useState, useEffect } from 'react';
import { getStacksAccount } from './account';

export function useStxAddresses() {
  const { userSession } = useConnect();
  const [ownerStxAddress, setOwnerStxAddress] = useState();
  const [appStxAddress, setAppStxAddress] = useState();

  useEffect(() => {
    getUserData(userSession).then(userData => {
      const { address } = getStacksAccount(userData.appPrivateKey);
      setAppStxAddress(addressToString(address));
      setOwnerStxAddress(userData.profile.stxAddress);
    });
  }, [userSession]);

  return { ownerStxAddress, appStxAddress };
}
