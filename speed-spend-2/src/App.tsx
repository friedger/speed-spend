import { useEffect, useState } from 'react';
import { SpeedSpendNavBar } from './components/NavBar';
import { userSession } from './user-session';
import { Outlet } from 'react-router-dom';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    setLoggedIn(userSession.isSignInPending() || userSession.isUserSignedIn());
  }, []);
  return (
    <>
      <SpeedSpendNavBar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      {loggedIn ? <Outlet /> : <div>Explain</div>}
    </>
  );
}

export default App;
