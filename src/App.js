import React, { useState } from 'react';
import { useBlockstack } from 'react-blockstack';
import { Blockstack } from 'react-blockstack/dist/context';
import Landing from './Landing';
import Main from './Main';
import { Connect } from '@blockstack/connect';
import { useConnect } from '@blockstack/connect/dist/connect.cjs.production.min';

export default function App(props) {
  const [userSession, setUserSession] = useState();
  const authOptions = {
    redirectTo: '/',
    finished: ({ userSession }) => {
      console.log(userSession.loadUserData());
      setUserSession(userSession);
    },
    appDetails: {
      name: 'Speed Spend',
      icon: 'https://speed-spend.netlify.app/speedspend.png',
    },
  };
  return (
    <Connect authOptions={authOptions}>
      <Content userSession={userSession} />
    </Connect>
  );
}

function Content({ userSession }) {
  const authenticated = userSession;
  const person = userSession && userSession.loadUserData().person;
  return (
    <>
      {!authenticated && <Landing />}
      {person && <Main person={person} />}
    </>
  );
}
