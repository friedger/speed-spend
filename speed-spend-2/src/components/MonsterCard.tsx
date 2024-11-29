import { Button, Card, CardBody, CardHeader, Typography } from '@material-tailwind/react';
import { MonsterDetails } from '../lib/monster';
import { ellipse } from '../lib/account';
import { showContractCall } from '@stacks/connect';
import { CONTRACT_ADDRESS, MONSTERS_CONTRACT_NAME, NETWORK } from '../lib/constants';
import { AnchorMode, PostConditionMode, uintCV } from '@stacks/transactions';
import { TxStatus } from './TxStatus';
import { useState } from 'react';

export const MonsterCard = ({
  monster,
  currentUser,
  actionLabel,
  onClick,
}: {
  monster: MonsterDetails;
  currentUser?: string;
  actionLabel?: string;
  onClick: () => void;
}) => {
  const [txId, setTxId] = useState<string>();
  const feed = async () => {
    setTxId('');
    await showContractCall({
      contractAddress: CONTRACT_ADDRESS,
      contractName: MONSTERS_CONTRACT_NAME,
      functionName: 'feed-monster',
      functionArgs: [uintCV(monster.metaData.id)],
      network: NETWORK,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Deny,
      onFinish: result => {
        setTxId(result.txId);
      },
    });
  };
  const owner = ellipse(monster.owner);
  return (
    <Card className="w-60 hover:shadow-lg transform hover:scale-105 transition duration-300">
      <CardHeader className="relative flex flex-col justify-center items-center mt-6">
        <img
          className="h-32 w-32 rounded-full object-cover object-center mt-2"
          src={`/monsters/monster-${monster.metaData.id}.jpg`}
          alt="monster"
        />
        <Typography variant="h6" color="gray">
          {monster.metaData?.name
            ? `${monster.metaData.name} (#${monster.metaData.id.toString()})`
            : `Monster #${monster.metaData.id.toString()}`}
        </Typography>
      </CardHeader>
      <CardBody className="text-center">
        <Typography className="text-gray-500 text-sm mb-4">
          {currentUser === monster.owner ? 'Owned by me' : `Owner: ${owner}`}
        </Typography>
        <Typography className="text-gray-500 text-sm">
          Last Meal: {new Date(monster.metaData?.lastMeal * 1000).toLocaleDateString()}
        </Typography>
        <Typography className="text-gray-500 text-sm">
          {monster.alive ? 'Status: Alive' : 'Status: Not Alive'}
        </Typography>
        {monster.alive && currentUser === monster.owner && (
          <>
            <Button size="sm" className="mt-2" onClick={feed}>
              Feed
            </Button>
            {txId && <TxStatus txId={txId} resultPrefix="Feeding block:" />}
          </>
        )}
        {actionLabel && ( 
          <Button size="sm" className="mt-2" onClick={onClick}>
            {actionLabel}
          </Button>
        )}
      </CardBody>
    </Card>
  );
};
