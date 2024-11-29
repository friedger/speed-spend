import { Button, Input, Typography } from '@material-tailwind/react';
import { showContractCall } from '@stacks/connect';
import { PostConditionMode, uintCV, stringAsciiCV, AnchorMode } from '@stacks/transactions';
import { useState, useEffect } from 'react';
import { CONTRACT_ADDRESS, NETWORK, MONSTERS_CONTRACT_NAME } from '../lib/constants';
import { TxStatus } from './TxStatus';
import { fetchAccount } from '../lib/account';

export function CreateMonster({ stxAddress }: { stxAddress: string }) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [newName, setNewName] = useState<string>('');

  useEffect(() => {
    if (stxAddress) {
      fetchAccount(stxAddress).catch(e => {
        setStatus('Failed to access your account');
        console.error(e);
      });
    }
  }, [stxAddress]);

  const claimAction = async () => {
    if (!newName.trim()) {
      setStatus('Please provide a name for your monster.');
      return;
    }

    setLoading(true);

    try {
      setStatus('Sending transaction...');
      await showContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        functionName: 'create-monster',
        functionArgs: [
          stringAsciiCV(newName.trim()),
          uintCV(Math.floor(Math.random() * 109)), // Random number for monster characteristics.
        ],
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Deny,
        onFinish: result => {
          setTxId(result.txId);
          setStatus(`The monster is born...`);
          setLoading(false);
        },
        onCancel: () => {
          setLoading(false);
        },
      });
    } catch (e: any) {
      console.error(e);
      setStatus(`Transaction failed: ${e.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="create-monster-container">
      <Typography variant="h5" className="mb-4">
        Create your Monster on the Nakamoto testnet in seconds!
      </Typography>
      <div className="w-72 m-1">
        <Input
          label="Monster Name"
          placeholder="Enter a monster name (max 20 characters)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyUp={e => {
            if (e.key === 'Enter') claimAction();
          }}
        />
        <Button onClick={claimAction} disabled={loading || !newName.trim()} className="m-1">
          {loading ? 'Creating...' : 'Create'}
        </Button>
      </div>
      {txId && <TxStatus txId={txId} resultPrefix="Monster created with ID: " />}
      {status && <div className="status-message mt-2">{status}</div>}
    </div>
  );
}
