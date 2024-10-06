import { Card, CardBody, CardHeader, Typography } from '@material-tailwind/react';
import { SpendField } from '../components/SpendField';
import { userSession } from '../user-session';

export default function SendStx() {
  const userData = userSession?.loadUserData();
  const profile = userData?.profile;
  if (!profile) return <></>;
  return (
    <Card shadow={false} className="mt-1">
      <CardHeader shadow={false} floated={false} className="text-center">
        <Typography variant="h1" color="blue-gray" className="mb-4 !text-3xl lg:text-4xl">
          Send STX
        </Typography>
        <Typography className="!text-gray-600 text-[18px] font-normal md:max-w-sm">
          Send tokens to your friends using BNS v2
        </Typography>
      </CardHeader>
      <CardBody>
        <SpendField
          title="Send 1000 uSTX to"
          placeholder="Username"
          stxAddress={profile.stxAddress.testnet}
        />
      </CardBody>
    </Card>
  );
}
