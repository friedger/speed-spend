import React from 'react';
import ReactDOM from 'react-dom';
import App from './App.js';
// Require Sass file so webpack can build it
import 'bootstrap/dist/css/bootstrap.css';
import './styles/style.css';
import Auth from './components/Auth.js';

ReactDOM.render(<App />, document.getElementById('App'));
ReactDOM.render(<Auth />, document.getElementById('Auth'));
