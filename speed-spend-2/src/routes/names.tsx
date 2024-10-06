import { Card, CardBody, CardHeader, Typography } from '@material-tailwind/react';
import { ClaimName } from '../components/ClaimName';
import { userSession } from '../user-session';
import { BNSV2_CONTRACT_ADDRESS, BNSV2_CONTRACT_NAME } from '../lib/constants';
import { Link } from 'react-router-dom';

export default function Names() {
  const userData = userSession?.loadUserData();
  const profile = userData?.profile;
  if (!profile) return <></>;
  return (
    <Card shadow={false} className="mt-1">
      <CardHeader shadow={false} floated={false} className="text-center">
        <Typography variant="h1" color="blue-gray" className="mb-4 !text-3xl lg:text-4xl">
          Names
        </Typography>
        <Typography className="!text-gray-600 text-[18px] font-normal md:max-w-sm">
          The namespace .btc is registered on Nakamoto testnet. It uses{' '}
          <Link
            to={`https://explorer.hiro.so/address/${BNSV2_CONTRACT_ADDRESS}.${BNSV2_CONTRACT_NAME}`}
          >
            {BNSV2_CONTRACT_NAME}
          </Link>{' '}
          that correspond to BNS v2 on mainnet.
        </Typography>
      </CardHeader>
      <CardBody>
        <ClaimName title="Claim now" placeholder="Name" stxAddress={profile.stxAddress.testnet} />
      </CardBody>
    </Card>
  );
}
