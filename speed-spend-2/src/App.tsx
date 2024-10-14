import { useEffect, useState } from 'react';
import { SpeedSpendNavBar } from './components/NavBar';
import { userSession } from './user-session';
import { Outlet } from 'react-router-dom';
import { Explainer } from './components/Explainer';
import { Footer } from './components/Footer';
import { ConnectButton } from './components/ConnectButton';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  useEffect(() => {
    setLoggedIn(userSession.isSignInPending() || userSession.isUserSignedIn());
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <SpeedSpendNavBar loggedIn={loggedIn} setLoggedIn={setLoggedIn} />
      <main className="flex-grow">
        {loggedIn ? (
          <Outlet />
        ) : (
          <div className="place-content-center">
            <Explainer />
            <div className="flex place-content-center my-10">
              <ConnectButton setLoggedIn={setLoggedIn} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
