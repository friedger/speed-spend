import { Button } from '@material-tailwind/react';
import { showConnect } from '@stacks/connect';
import { authOptions, userSession } from '../user-session';

export function ConnectButton({
  setLoggedIn,
}: {
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  console.log(userSession.isSignInPending());

  return (
    <Button
      size="sm"
      onClick={() => {
        showConnect({
          ...authOptions,
          onFinish: () => {
            setLoggedIn(true);
          },
        });
      }}
    >
      Connect Wallet
    </Button>
  );
}
