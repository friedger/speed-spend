import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import ReactBlockstack from 'react-blockstack';
import App from './App.js';

// Require Sass file so webpack can build it
import 'bootstrap/dist/css/bootstrap.css';
import './styles/style.css';
import { appConfig, finished } from './UserSession.js';
import Auth from './Auth.js';

// eslint-disable-next-line
const blockstack = ReactBlockstack({ appConfig });
(() => {
  if (blockstack.userSession.isSignInPending()) {
    blockstack.userSession.handlePendingSignIn().then(userData => {
      finished(() => {
        console.log('handling pending sign in on launch');
      })({ userSession: blockstack.userSession });
    });
  }
})();

ReactDOM.render(
  <Router>
    <App />
  </Router>,
  document.getElementById('App')
);
ReactDOM.render(<Auth />, document.getElementById('Auth'));
