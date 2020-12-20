import React, { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import Overview from './pages/Overview';
import Hodl from './pages/Hodl';
import HodlTokens from './pages/HodlTokens';
import { Connect } from '@stacks/connect-react';
import { useConnect } from '@stacks/connect-react';
import { connectOptions } from './UserSession';
import { Link, Router } from '@reach/router';
import Jackpot from './pages/Jackpot';
import AtTwo from './pages/AtTwo';
import Monsters from './pages/Monsters';
import MonsterDetails from './pages/MonsterDetails';
import ClarityValues from './pages/ClarityValues';
import MyProfile from './pages/MyProfile';
import SpeedSpend from './pages/SpeedSpend';
import Marketplace from './pages/Marketplace';
import { NETWORK } from './lib/constants';
import StackingActivies from './pages/StackingActivities';
import Rockets from './pages/Rockets';

export default function App(props) {
  const [userSession, setUserSession] = useState();
  const { userSession: session } = useConnect();

  useEffect(() => {
    if (session.isUserSignedIn()) {
      setUserSession(session);
      console.log({ userData: session.loadUserData() });
    }
  }, [session]);

  const authOptions = connectOptions(({ userSession }) => setUserSession(userSession));
  return (
    <Connect authOptions={authOptions}>
      <Content userSession={userSession} />
    </Connect>
  );
}

const NavLink = props => {
  return (
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
};

function AppBody(props) {
  return (
    <div>
      <nav className="navbar navbar-expand-md nav-pills nav-justified mx-auto">
        <NavLink to="/">Overview</NavLink>
        <NavLink to="/speed-spend">Speed Spend</NavLink>
        <NavLink to="/stacking">Stacking</NavLink>
        <NavLink to="/hodl">Hodl</NavLink>
        <NavLink to="/hodl-tokens">Hodl Tokens</NavLink>
        <NavLink to="/jackpot">Flip Coin with Jackpot</NavLink>
        <NavLink to="/at-two">Flip Coin at two</NavLink>
        <NavLink to="/monsters">Monsters</NavLink>
        <NavLink to="/openriff">Open Riff</NavLink>
        <NavLink to="/rockets">Rockets</NavLink>
        <NavLink to="/me">Profile</NavLink>
      </nav>
      {props.children}
      <div>{NETWORK.coreApiUrl}</div>
    </div>
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
          <Router>
            <AppBody path="/">
              <Overview path="/" decentralizedID={decentralizedID} />
              <SpeedSpend path="/speed-spend" decentralizedID={decentralizedID} />
              <Hodl path="/hodl" decentralizedID={decentralizedID} />
              <HodlTokens path="/hodl-tokens" decentralizedID={decentralizedID} />
              <Jackpot path="/jackpot" decentralizedID={decentralizedID} />
              <AtTwo path="/at-two" decentralizedID={decentralizedID} />
              <Monsters exact path="/monsters" decentralizedID={decentralizedID} />
              <Marketplace exact path="/openriff" decentralizedID={decentralizedID} />
              <MonsterDetails path="/monsters/:monsterId" decentralizedID={decentralizedID} />
              <Rockets path="/rockets" decentralizedID={decentralizedID} />
              <MyProfile path="/me" decentralizedID={decentralizedID} />
              <ClarityValues path="/cv" />
              <StackingActivies path="/stacking"></StackingActivies>
            </AppBody>
          </Router>
        </>
      )}
    </>
  );
}
