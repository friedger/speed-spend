import React, { useState, useEffect } from 'react';
import Landing from './Landing';
import Main from './pages/Main';
import Hodl from './pages/Hodl';
import HodlTokens from './pages/HodlTokens';
import { Connect } from '@blockstack/connect';
import { useBlockstack, useConnectOptions } from 'react-blockstack';
import { connectOptions } from './UserSession';
import { Link, Router } from '@reach/router';
import Jackpot from './pages/Jackpot';
import AtTwo from './pages/AtTwo';
import Monsters from './pages/Monsters';

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
      authOptions={useConnectOptions(
        connectOptions(({ userSession }) => setUserSession(userSession))
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
      {decentralizedID && (
        <>
          <nav className="navbar navbar-expand-md mx-auto">
            <div className="nav-brand">Features:</div>
            <Link to="/" className="nav-item px-4">
              Speed Spend
            </Link>
            <Link to="/hodl" className="nav-item px-4">
              Hodl
            </Link>
            <Link to="/hodl-tokens" className="nav-item px-4">
              Hodl Tokens
            </Link>
            <Link to="/jackpot" className="nav-item px-4">
              Flip Coin with Jackpot
            </Link>
            <Link to="/at-two" className="nav-item px-4">
              Flip Coin at two
            </Link>
            <Link to="/monsters" className="nav-item px-4">
              Monsters
            </Link>
          </nav>
          <Router>
            <Main path="/" decentralizedID={decentralizedID} />
            <Hodl path="/hodl" decentralizedID={decentralizedID} />
            <HodlTokens path="/hodl-tokens" decentralizedID={decentralizedID} />
            <Jackpot path="/jackpot" decentralizedID={decentralizedID} />
            <AtTwo path="/at-two" decentralizedID={decentralizedID} />
            <Monsters path="/monsters" decentralizedID={decentralizedID} />
          </Router>
        </>
      )}
    </>
  );
}
