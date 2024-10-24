import { Button, Input, Typography } from '@material-tailwind/react';
import { showContractCall } from '@stacks/connect';
import { PostConditionMode, uintCV, stringAsciiCV, AnchorMode } from '@stacks/transactions';
import { useState, useEffect, useRef } from 'react';
import { CONTRACT_ADDRESS, NETWORK, MONSTERS_CONTRACT_NAME } from '../lib/constants';
import { resultToStatus } from '../lib/transactions';
import { TxStatus } from './TxStatus';
import { fetchAccount } from '../lib/account';

export function CreateMonster({ stxAddress }: { stxAddress: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [newName, setNewName] = useState<string>('');
  const spinner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (stxAddress) {
      fetchAccount(stxAddress).catch(e => {
        setStatus('Failed to access your account');
        console.log(e);
      });
    }
  }, [stxAddress]);

  const claimAction = async () => {
    if (!newName.trim()) {
      setStatus('Please provide a name for your monster.');
      return;
    }

    spinner.current?.classList.remove('d-none');
    setLoading(true);

    try {
      setStatus('Sending transaction...');
      await showContractCall({
        contractAddress: 'ST3FFRX7C911PZP5RHE148YDVDD9JWVS6FZRA60VS',
        contractName: 'monsters',
        functionName: 'create-monster',
        functionArgs: [
          stringAsciiCV(newName.trim()),
          uintCV(Math.floor(Math.random() * 109)), // Random number for monster characteristics.
        ],
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: result => {
          setTxId(result.txId);
          setStatus(resultToStatus(result));
          setLoading(false);
          spinner.current?.classList.add('d-none');
        },
      });
    } catch (e: any) {
      console.error(e);
      setStatus(`Transaction failed: ${e.message}`);
      setLoading(false);
      spinner.current?.classList.add('d-none');
    }
  };

  return (
    <div className="create-monster-container">
      <Typography variant="h5" className="mb-4">
        Create your Monster on the Nakamoto testnet in seconds!
      </Typography>
      <div className="input-group mb-2">
        <Input
          label="Monster Name"
          placeholder="Enter a monster name (max 20 characters)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyUp={e => {
            if (e.key === 'Enter') claimAction();
          }}
          disabled={loading}
        />
        <Button onClick={claimAction} disabled={loading || !newName.trim()} className="ml-2">
          <div
            ref={spinner}
            className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
          />
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </div>
      {txId && <TxStatus txId={txId} resultPrefix="Monster created with ID: " />}
      {status && <div className="status-message mt-2">{status}</div>}
    </div>
  );
}
