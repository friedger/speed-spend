import { Card, CardBody, CardHeader, Typography, Button } from '@material-tailwind/react';
import { CreateMonster } from '../components/CreateMonster';
import { userSession } from '../user-session';
import { MyMonster } from '../components/MyMonsters';

export default function Monsters() {
  const userData = userSession?.loadUserData();
  const profile = userData?.profile;
  if (!profile) return <></>;

  return (
    <Card shadow={false} className="mt-1">
      <CardHeader shadow={false} floated={false} className="text-center">
        <Typography variant="h1" color="blue-gray" className="mb-4 !text-3xl lg:text-4xl">
          Monsters
        </Typography>
        <Typography className="!text-gray-600 text-[18px] font-normal md:max-w-sm">
          Welcome to the Monsters Page!
        </Typography>
      </CardHeader>
      <CardBody>
        <CreateMonster title="Create Monster" placeholder="Name" stxAddress={profile.stxAddress.testnet} />
      </CardBody>
      <CardBody>
        <Typography className="mb-5 !text-3xl lg:text-4xl">
          My monsters
        </Typography>
        <MyMonster title="My monster" placeholder="Name" stxAddress={profile.stxAddress.testnet}/>
      </CardBody>
    </Card>
  );
}
