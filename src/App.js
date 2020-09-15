import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Overview from './pages/Overview';
import Hodl from './pages/Hodl';
import HodlTokens from './pages/HodlTokens';
import { Connect } from '@blockstack/connect';
import { useBlockstack, useConnectOptions } from 'react-blockstack';
import { connectOptions } from './UserSession';
import { Link, Router } from '@reach/router';
import Jackpot from './pages/Jackpot';
import AtTwo from './pages/AtTwo';
import Monsters from './pages/Monsters';
import MonsterDetails from './pages/MonsterDetails';
import ClarityValues from './pages/ClarityValues';
import MyProfile from './pages/MyProfile';
import SpeedSpend from './pages/SpeedSpend';

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

const NavLink = props => (
  <Link
    {...props}
    getProps={({ isCurrent }) => {
      // the object returned here is passed to the
      // anchor element's props
      if (isCurrent) {
        return {
          className: 'nav-item nav-link px-4 active',
        };
      } else {
        return { className: 'nav-item nav-link px-4' };
      }
    }}
  />
);

function Content({ userSession }) {
  const authenticated = userSession && userSession.isUserSignedIn();
  const decentralizedID =
    userSession && userSession.isUserSignedIn() && userSession.loadUserData().decentralizedID;
  return (
    <>
      {!authenticated && <Landing />}
      {decentralizedID && (
        <>
          <nav className="navbar navbar-expand-md nav-pills nav-justified mx-auto">
            <NavLink to="/">Overview</NavLink>
            <NavLink to="/speed-spend">Speed Spend</NavLink>
            <NavLink to="/hodl">Hodl</NavLink>
            <NavLink to="/hodl-tokens">Hodl Tokens</NavLink>
            <NavLink to="/jackpot">Flip Coin with Jackpot</NavLink>
            <NavLink to="/at-two">Flip Coin at two</NavLink>
            <NavLink to="/monsters">Monsters</NavLink>
            <NavLink to="/me">Profile</NavLink>
          </nav>
          <Router>
            <Overview path="/" decentralizedID={decentralizedID} />
            <SpeedSpend path="/speed-spend" decentralizedID={decentralizedID} />
            <Hodl path="/hodl" decentralizedID={decentralizedID} />
            <HodlTokens path="/hodl-tokens" decentralizedID={decentralizedID} />
            <Jackpot path="/jackpot" decentralizedID={decentralizedID} />
            <AtTwo path="/at-two" decentralizedID={decentralizedID} />
            <Monsters path="/monsters" decentralizedID={decentralizedID} />
            <MonsterDetails path="/monsters/:monsterId" decentralizedID={decentralizedID} />
            <MyProfile path="/me" decentralizedID={decentralizedID} />
            <ClarityValues path="/cv" />
          </Router>
        </>
      )}
    </>
  );
}
