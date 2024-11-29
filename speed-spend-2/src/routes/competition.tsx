import { Typography } from '@material-tailwind/react';
import {
  ClarityType,
  cvToString,
  getContractMapEntry,
  hexToCV,
  OptionalCV,
  ResponseOkCV,
  TupleCV,
  UIntCV,
  uintCV,
} from '@stacks/transactions';
import React, { useEffect, useState } from 'react';
import { MonsterCard } from '../components/MonsterCard';
import { CONTRACT_ADDRESS, infoApi, MONSTERS_CONTRACT_NAME, NETWORK, smartContractsApi } from '../lib/constants';
import { fetchMonsterDetails, MonsterDetails } from '../lib/monster';
import { fetchParticipants, fetchTenure } from '../lib/competition';

// Define the types for better TypeScript support
interface CompetitionData {
  monsters: MonsterDetails[];
  secondBestPrize?: MonsterDetails;
}

const getCompetitionData = async (): Promise<CompetitionData> => {
  try {
    const { tenure_height: tenureHeight } = await infoApi
      .getCoreApiInfoRaw()
      .then(r => r.raw.json());
    console.log({ tenureHeight });
    const entry = (await getContractMapEntry({
      contractAddress: CONTRACT_ADDRESS,
      contractName: MONSTERS_CONTRACT_NAME,
      mapName: 'second-bests',
      mapKey: uintCV(tenureHeight),
      network: NETWORK,
    })) as OptionalCV<TupleCV<{ 'monster-id': UIntCV; count: UIntCV }>>;
    console.log({ entry: cvToString(entry) });
    if (entry.type === ClarityType.OptionalSome && entry.value.data['monster-id'].value > 0n) {
      const prize = await fetchMonsterDetails(entry.value.data['monster-id'].value);
      return { monsters: [], secondBestPrize: prize };
    } else {
      return { monsters: [], secondBestPrize: undefined };
    }
  } catch (error) {
    console.error('Error fetching competition data:', error);
    return {
      monsters: [],
    };
  }
};

const Competition: React.FC = () => {
  const [competitionData, setCompetitionData] = useState<CompetitionData | null>(null);
  const [participants, setParticipants] = useState<string[]>([]);
  const [tenure, setTenure] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch competition data when the component mounts
    getCompetitionData().then(data => {
      setCompetitionData(data);
      setLoading(false);
    });

    // Fetch participants
    fetchParticipants().then(data => setParticipants(data));

    // Fetch tenure for a specific participant or general competition
    const participantId = 1n; // Replace with a dynamic participant ID if needed
    fetchTenure(participantId).then(data => setTenure(data));
  }, []);

  if (loading) return <p>Loading competition data...</p>;

  if (!competitionData) {
    return <p>No competition data available.</p>;
  }

  const { monsters } = competitionData;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">Monster Competition</h1>

      <div className="text-center mb-6">
        <Typography>
          The competition takes one tenure (usually 1 Bitcoin block). The monster that used the most
          tools (calling "use" contract function) wins the competition. The prize is the second-best
          monster.
        </Typography>
      </div>

      <div className="bg-white p-4 rounded shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Prize</h2>
        {competitionData.secondBestPrize ? (
          <MonsterCard
            monster={competitionData.secondBestPrize}
            onClick={() => {
              return;
            }}
          />
        ) : (
          <Typography>No prize available.</Typography>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Participants</h2>
        {participants.length === 0 ? (
          <Typography>No participants found.</Typography>
        ) : (
          <ul className="list-disc pl-6">
            {participants.map((participant, index) => (
              <li key={index} className="text-gray-700">
                {participant}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-2">Tenure</h2>
        {tenure !== null ? (
          <Typography>The current tenure for the participant is: {tenure}</Typography>
        ) : (
          <Typography>Unable to fetch tenure.</Typography>
        )}
      </div>
    </div>
  );
};

export default Competition;
