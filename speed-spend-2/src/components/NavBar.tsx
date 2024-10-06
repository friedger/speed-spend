import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { Collapse, IconButton, List, ListItem, Navbar, Typography } from '@material-tailwind/react';
import React from 'react';
import { ConnectButton } from './ConnectButton';
import { SignOutButton } from './SignOutButton';
import { Link } from 'react-router-dom';

function NavList() {
  return (
    <List className="mb-6 mt-4 p-0 lg:mb-0 lg:mt-0 lg:flex-row lg:p-1">
      <Typography variant="small" color="blue-gray" className="font-medium">
        <ListItem className="flex items-center gap-2 py-2 pr-4">
          <Link to={'/send-stx'}>Send STX</Link>
        </ListItem>
      </Typography>
      <Typography variant="small" color="blue-gray" className="font-medium">
        <ListItem className="flex items-center gap-2 py-2 pr-4">
          <Link to={'/names'}>Names</Link>
        </ListItem>
      </Typography>
    </List>
  );
}

export function SpeedSpendNavBar({
  loggedIn,
  setLoggedIn,
}: {
  loggedIn: boolean;
  setLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    window.addEventListener('resize', () => window.innerWidth >= 960 && setOpenNav(false));
  }, []);

  return (
    <Navbar className="mx-auto max-w-screen-xl px-4 py-2">
      <div className="flex items-center justify-between text-blue-gray-900">
        <Typography variant="h6" className="mr-4 cursor-pointer py-1.5 lg:ml-2">
          <Link to="/">Speed Spend</Link>
        </Typography>
        <div className="hidden lg:block">
          <NavList />
        </div>
        <div className="hidden gap-2 lg:flex">
          {loggedIn ? <SignOutButton /> : <ConnectButton setLoggedIn={setLoggedIn} />}
        </div>
        <IconButton variant="text" className="lg:hidden" onClick={() => setOpenNav(!openNav)}>
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        <NavList />
        <div className="flex w-full flex-nowrap items-center gap-2 lg:hidden">
          {loggedIn ? <SignOutButton /> : <ConnectButton setLoggedIn={setLoggedIn} />}
        </div>
      </Collapse>
    </Navbar>
  );
}