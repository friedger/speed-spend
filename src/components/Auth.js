import { useConnect } from '@stacks/connect-react';
import React from 'react';

// Authentication button adapting to status

export default function Auth(props) {
  const { userSession } = useConnect();

  if (userSession) {
    return (
      <button
        className="btn btn-primary btn-lg"
        onClick={() => {
          console.log('signOut');
          userSession.signUserOut();
        }}
      >
        {userSession ? 'Log Out' : '...'}
      </button>
    );
  } else {
    return null;
  }
}
