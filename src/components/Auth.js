import React from 'react';

// Authentication button adapting to status

export default function Auth({ userSession }) {
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
