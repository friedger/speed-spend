import { Card, CardBody, CardHeader, Typography, Button } from '@material-tailwind/react';

import { fetchAccount } from '../lib/account';

export function MyMonster({ title, placeholder, stxAddress }: { title: string; placeholder: string; stxAddress: string }) {
  return (
    <div className="my-monsters-grid grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 p-4 justify-items-center">
      {Array.from({ length: 1 }).map((_, index) => (
        <Card key={index} className="w-60 hover:shadow-lg transform hover:scale-105 transition duration-300">
          <CardHeader className="relative h-32 overflow-hidden">
            {/* Placeholder for the NFT image */}
            <div className="bg-gray-200 h-full flex items-center justify-center">
              <Typography variant="h6" color="gray">
                Monster #{index + 1}
              </Typography>
            </div>
          </CardHeader>
          <CardBody className="text-center">
            <Typography variant="h5" className="text-blue-gray-800 mb-2">
              {`Monster Name ${index + 1}`}
            </Typography>
            <Typography className="text-gray-500 text-sm mb-4">
              Owner: {stxAddress}
            </Typography>
            <Button size="sm" color="lightBlue" className="mt-2">
              View Details
            </Button>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
