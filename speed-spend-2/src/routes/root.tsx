import { Card, CardBody, CardHeader, List, ListItem, Typography } from '@material-tailwind/react';
import { Explainer } from '../components/Explainer';

export default function Root() {
  return (
    <>
      <Explainer />
      <Card shadow={false} className="mt-1">
        <CardHeader shadow={false} floated={false} className="text-center">
          <Typography variant="h1" color="blue-gray" className="mb-4 !text-3xl lg:text-4xl">
            Try it now
          </Typography>
        </CardHeader>
        <CardBody>
          <List>
            <a href="/send-stx" className="text-initial">
              <ListItem>Send tSTX to your friends</ListItem>
            </a>
            <a href="/names" className="text-initial">
              <ListItem>Claim BNS v2 name</ListItem>
            </a>
          </List>
        </CardBody>
      </Card>
    </>
  );
}
