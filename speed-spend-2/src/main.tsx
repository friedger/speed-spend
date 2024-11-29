import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@material-tailwind/react';

import App from './App';
import ErrorPage from './error-page';
import SendStx from './routes/send-stx';
import Names from './routes/names';
import Monsters from './routes/monsters';
import Competition from './routes/competition';
import './output.css';
import Root from './routes/root';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
    children: [
      { path: '/send-stx', element: <SendStx /> },
      { path: '/names', element: <Names /> },
      { path: '/monsters', element: <Monsters /> },
      { path: '/competition', element: <Competition /> },
      { index: true, element: <Root /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
