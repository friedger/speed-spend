import React, { useEffect, useState } from 'react';
import { Button, Input, Typography } from '@material-tailwind/react';
// Define the types for better TypeScript support
interface Monster {
  id: string;
  name: string;
  owner: string;
  power: number; // Example attribute (could be strength or skill)
}

interface CompetitionData {
  monsters: Monster[];
  secondBestPrize: string; // The prize description for the second-best monster.
}

// Replace with your actual API endpoint or function to fetch competition data.
const getCompetitionData = async (): Promise<CompetitionData> => {
  try {
    const response = await fetch('/api/competition');
    const data = await response.json();
    return {
      monsters: data.monsters,
      secondBestPrize: data.secondBestPrize,
    };
  } catch (error) {
    console.error('Error fetching competition data:', error);
    return {
      monsters: [],
      secondBestPrize: 'No prize available',
    };
  }
};

const Competition: React.FC = () => {
  const [competitionData, setCompetitionData] = useState<CompetitionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch competition data when the component mounts
    getCompetitionData().then((data) => {
      setCompetitionData(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading competition data...</p>;

  if (!competitionData) {
    return <p>No competition data available.</p>;
  }

  const { monsters, secondBestPrize } = competitionData;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-center">Monster Competition</h1>
      
      <div className="text-center mb-6">
        <Button className="ml-2">
          Join Competition
        </Button>
      </div>

      <div className="bg-white p-4 rounded shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-2">Second Best Prize</h2>
        <p className="text-gray-700">{secondBestPrize}</p>
      </div>

      <div className="bg-white p-4 rounded shadow-md">
        <h2 className="text-xl font-semibold mb-2">Current Monsters in Competition</h2>
        {monsters.length === 0 ? (
          <p className="text-gray-500">No monsters are currently in the competition.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monsters.map((monster) => (
              <div
                key={monster.id}
                className="card bg-gray-50 p-4 rounded shadow transform transition-transform duration-200 ease-in-out hover:scale-105 hover:shadow-lg"
              >
                <h3 className="text-lg font-bold">{monster.name}</h3>
                <p className="text-gray-600">Owner: {monster.owner}</p>
                <p className="text-gray-500">Power: {monster.power}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Competition;
