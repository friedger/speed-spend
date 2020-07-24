import React, { useState, useEffect } from 'react';
import Landing from './Landing';
import Main from './Main';
import { Connect } from '@blockstack/connect';
import { useBlockstack, useConnectOptions } from 'react-blockstack';
import { connectOptions } from './UserSession';

export default function App(props) {
  const [userSession, setUserSession] = useState();
  const { userSession: session } = useBlockstack();

  useEffect(() => {
    if (session.isUserSignedIn()) {
      setUserSession(session);
      console.log({ userData: session.loadUserData() });
    }
  }, [session]);

  return (
    <Connect
      authOptions={useConnectOptions(connectOptions, ({ userSession }) =>
        setUserSession(userSession)
      )}
    >
      <Content userSession={userSession} />
    </Connect>
  );
}

function Content({ userSession }) {
  const authenticated = userSession && userSession.isUserSignedIn();
  const decentralizedID =
    userSession && userSession.isUserSignedIn() && userSession.loadUserData().decentralizedID;
  return (
    <>
      {!authenticated && <Landing />}
      {decentralizedID && <Main decentralizedID={decentralizedID} />}
    </>
  );
}
