import React, { useEffect } from 'react';
import Landing from './pages/Landing';
import Overview from './pages/Overview';
import Hodl from './pages/Hodl';
import HodlTokens from './pages/HodlTokens';
import { Connect } from '@stacks/connect-react';
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
import Auth from './components/Auth';
import OverviewTokens from './pages/OverviewTokens';
import OverviewContracts from './pages/OverviewContracts';
import OverviewNFTs from './pages/OverviewNFTs';
import PoxLite from './pages/PoxLite';
import { userDataState, userSessionState, useConnect } from './lib/auth';
import { useAtom } from 'jotai';

export default function App(props) {
  const { authOptions } = useConnect();
  const [userSession] = useAtom(userSessionState);
  const [, setUserData] = useAtom(userDataState);
  useEffect(() => {
    if (userSession?.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    } else if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn();
    }
  }, [userSession, setUserData]);

  return (
    <Connect authOptions={authOptions}>
      <nav className="navbar sticky-top navbar-dark bg-dark text-light">
        <a className="navbar-brand" href="https://testnet.blockstack.org">
          <img src="/stackstestnet.png" alt="Logo" />
        </a>
        <Auth className="ml-auto" userSession={userSession} />
      </nav>

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
/*
        <NavLink to="/speed-spend">Speed Spend</NavLink>
        <NavLink to="/stacking">Stacking</NavLink>
        <NavLink to="/hodl">Hodl</NavLink>
        <NavLink to="/hodl-tokens">Hodl Tokens</NavLink>
        <NavLink to="/jackpot">Flip Coin with Jackpot</NavLink>
        <NavLink to="/at-two">Flip Coin at two</NavLink>
        <NavLink to="/monsters">Monsters</NavLink>
        <NavLink to="/openriff">Open Riff</NavLink>
        <NavLink to="/rockets">Rockets</NavLink>
*/
function AppBody(props) {
  return (
    <div>
      <nav className="navbar navbar-expand-md nav-pills nav-justified mx-auto">
        <NavLink to="/">Overview</NavLink>
        <NavLink to="/tokens">Tokens</NavLink>
        <NavLink to="/contracts">Contracts</NavLink>
        <NavLink to="/nfts">NFTs</NavLink>
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
              <OverviewTokens path="/tokens" />
              <OverviewContracts path="/contracts" />
              <OverviewNFTs path="/nfts" />
              <SpeedSpend path="/speed-spend" decentralizedID={decentralizedID} />
              <Hodl path="/hodl" decentralizedID={decentralizedID} />
              <HodlTokens path="/hodl-tokens" decentralizedID={decentralizedID} />
              <Jackpot path="/jackpot" decentralizedID={decentralizedID} />
              <AtTwo path="/at-two" decentralizedID={decentralizedID} />
              <Monsters exact path="/monsters" decentralizedID={decentralizedID} />
              <Marketplace exact path="/openriff" decentralizedID={decentralizedID} />
              <MonsterDetails path="/monsters/:monsterId" decentralizedID={decentralizedID} />
              <Rockets path="/rockets" decentralizedID={decentralizedID} />
              <PoxLite path="/poxlite" decentralizedID={decentralizedID} />
              <MyProfile path="/me" decentralizedID={decentralizedID} userSession={userSession} />
              <ClarityValues path="/cv" />
              <StackingActivies path="/stacking"></StackingActivies>
            </AppBody>
          </Router>
        </>
      )}
    </>
  );
}
