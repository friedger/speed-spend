import { Card, CardBody, CardHeader, Typography, Button } from '@material-tailwind/react';
import { getUserName } from '../lib/account';
import { useState, useEffect } from 'react';
import { fetchMonsterDetails, fetchMonsterIds, MonsterDetails } from '../lib/monster';
import { hexToCV, UIntCV } from '@stacks/transactions';

export function MyMonsters({ stxAddress }: { stxAddress: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [monsters, setMonsters] = useState<MonsterDetails[]>([]);

  // Fetch the BNS name for the user
  useEffect(() => {
    if (stxAddress) {
      setLoading(true);
      getUserName(stxAddress)
        .then(result => {
          if (result && result.name) {
            setUsername(result.name);
          } else {
            setStatus(`No name found for ${stxAddress}`);
          }
        })
        .catch(e => {
          setStatus(`Failed to get name for ${stxAddress}`);
          console.error(e);
        })
        .finally(() => setLoading(false));
    }
  }, [stxAddress]);

  // Fetch the user's monster IDs and details
  useEffect(() => {
    if (stxAddress) {
      setLoading(true);
      fetchMonsterIds(stxAddress)
        .then(async (monsterIds: string[]) => {
          console.log('Fetched Monster IDs:', monsterIds);
          if (monsterIds.length === 0) {
            setStatus('No monsters found for this user.');
            return;
          }

          try {
            const monstersDetails = await Promise.all(
              monsterIds.map(id => {
                const idCV = hexToCV(id) as UIntCV;
                return fetchMonsterDetails(idCV.value);
              })
            );
            console.log('Fetched Monster Details:', monstersDetails);
            setMonsters(monstersDetails);
          } catch (detailsError) {
            console.error('Error fetching monster details:', detailsError);
            setStatus('Failed to fetch monster details.');
          }
        })
        .catch((fetchError: any) => {
          console.error('Error fetching monster IDs:', fetchError);
          setStatus(`Failed to fetch monsters for ${stxAddress}`);
        })
        .finally(() => setLoading(false));
    }
  }, [stxAddress]);

  console.log({ monsters });
  return (
    <div className="my-monsters-container p-4">
      {/* Display the BNS name */}
      <div className="bns-name mb-4">
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Typography variant="h5" className="text-blue-gray-800">
            {username ? `Welcome, ${username}` : 'No BNS name found'}
          </Typography>
        )}
      </div>

      {/* Render monster cards */}
      <div className="my-monsters-grid grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 justify-items-center">
        {monsters.length > 0 ? (
          monsters.map((monster, index) => (
            <Card
              key={index}
              className="w-60 hover:shadow-lg transform hover:scale-105 transition duration-300"
            >
              <CardHeader className="relative h-32 overflow-hidden">
                <div className="bg-gray-200 h-full flex items-center justify-center">
                  <Typography variant="h6" color="gray">
                    Monster #{monster.metaData?.id.toString()}
                  </Typography>
                </div>
              </CardHeader>
              <CardBody className="text-center">
                <Typography variant="h5" className="text-blue-gray-800 mb-2">
                  {monster.metaData?.name || `Monster ${monster.metaData.id.toString()}`}
                </Typography>
                <Typography className="text-gray-500 text-sm mb-4">
                  Owner: {username || stxAddress}
                </Typography>
                <Typography className="text-gray-500 text-sm">
                  Last Meal: {new Date(monster.metaData?.lastMeal * 1000).toLocaleDateString()}
                </Typography>
                <Typography className="text-gray-500 text-sm">
                  {monster.alive ? 'Status: Alive' : 'Status: Not Alive'}
                </Typography>
                <Button size="sm" className="mt-2">
                  Use
                </Button>
              </CardBody>
            </Card>
          ))
        ) : (
          <Typography>{status || 'No monsters found for this user.'}</Typography>
        )}
      </div>
    </div>
  );
}
