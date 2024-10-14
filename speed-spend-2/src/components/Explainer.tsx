import { Typography } from '@material-tailwind/react';
import { Link } from 'react-router-dom';

export const Explainer = () => {
  return (
    <div className="w-4/5 mx-auto mt-4">
      <Typography>
        Speed Spend is a web site to test the Nakamoto testnet of the{' '}
        <Link to="https://nakamoto.run">Stacks blockchain</Link> for everyone.
      </Typography>
      <Typography>The main purpose is to demonstrate fast blocks of Nakamoto.</Typography>
    </div>
  );
};
