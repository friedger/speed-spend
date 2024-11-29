import { Typography } from '@material-tailwind/react';
import { showContractCall } from '@stacks/connect';
import {
  AnchorMode,
  hexToCV,
  noneCV,
  PostConditionMode,
  UIntCV,
  uintCV,
} from '@stacks/transactions';
import { useEffect, useState } from 'react';
import { CONTRACT_ADDRESS, MONSTERS_CONTRACT_NAME, NETWORK } from '../lib/constants';
import { fetchMonsterDetails, fetchMonsterIds, MonsterDetails } from '../lib/monster';
import { MonsterCard } from './MonsterCard';
import { TxStatus } from './TxStatus';

export function MyMonsters({ stxAddress }: { stxAddress: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [monsters, setMonsters] = useState<MonsterDetails[]>([]);
  const [txId, setTxId] = useState<string>('');

  // Fetch the user's monster IDs and details
  useEffect(() => {
    const fn = async () => {
      if (stxAddress) {
        setLoading(true);
        try {
          const monsterIds = await fetchMonsterIds(stxAddress);
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
        } catch (fetchError: any) {
          console.error('Error fetching monster IDs:', fetchError);
          setStatus(`Failed to fetch monsters for ${stxAddress}`);
        } finally {
          setLoading(false);
        }
      }
    };
    fn();
  }, [stxAddress]);

  // Function to call the smart contract to use a tool
  const useTool = async (monsterId: string) => {
    setTxId('');
    const parsedId = parseInt(monsterId, 10);
    if (isNaN(parsedId)) {
      setStatus('Invalid Monster ID.');
      return;
    }

    try {
      setStatus('Sending transaction...');

      await showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        functionName: 'use',
        functionArgs: [uintCV(parsedId), noneCV()],
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        onFinish: result => {
          setTxId(result.txId);
          setStatus(`Joining competition.`);
        },
      });
    } catch (e: any) {
      console.error(e);
      setStatus(`Transaction failed: ${e.message}`);
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <div className="mb-4">{<Typography>Loading...</Typography>}</div>
      ) : (
        <div className="my-monsters-grid grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 justify-items-center">
          {monsters.length > 0 ? (
            monsters.map((monster, index) => (
              <MonsterCard
                monster={monster}
                key={index}
                currentUser={stxAddress}
                actionLabel={monster.alive ? 'Join competition' : undefined}
                onClick={() => useTool(monster.metaData.id.toString())}
              />
            ))
          ) : (
            <Typography>No monsters found. Create one. It is fast...</Typography>
          )}
        </div>
      )}
      {status && <Typography>{status}</Typography>}
      {txId && <TxStatus txId={txId} resultPrefix="Tx result:" />}
    </div>
  );
}
