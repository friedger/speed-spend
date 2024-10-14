import { Button } from '@material-tailwind/react';
import { showConnect } from '@stacks/connect';
import { authOptions, userSession } from '../user-session';

export function ConnectButton({
  setLoggedIn,
  onClick,
}: {
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  onClick?: () => void;
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
        if (onClick) {
          onClick();
        }
      }}
    >
      Connect Wallet
    </Button>
  );
}
