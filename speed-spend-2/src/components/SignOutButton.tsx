import { useEffect, useState } from 'react';
import { userSession } from '../user-session';
import { Button } from '@material-tailwind/react';

export function SignOutButton() {
  const [visible, setVisible] = useState<boolean>(false);
  useEffect(() => {
    setVisible(userSession.isUserSignedIn());
  }, [userSession.isUserSignedIn()]);

  if (visible) {
    return (
      <Button
        variant="outlined"
        size="sm"
        onClick={() => {
          userSession.signUserOut('/');
        }}
      >
        Sign Out
      </Button>
    );
  } else {
    return null;
  }
}
