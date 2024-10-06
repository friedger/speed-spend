import { Button, Input, Typography } from '@material-tailwind/react';
import { showContractCall } from '@stacks/connect';
import {
  AnchorMode,
  bufferCVFromString,
  PostConditionMode,
  principalCV,
} from '@stacks/transactions';
import { useEffect, useState } from 'react';
import { getUserName } from '../lib/account';
import { BNSV2_CONTRACT_ADDRESS, BNSV2_CONTRACT_NAME, NETWORK } from '../lib/constants';
import { resultToStatus } from '../lib/transactions';
import { TxStatus } from './TxStatus';

export function ClaimName({
  title,
  placeholder,
  stxAddress,
}: {
  title: string;
  placeholder: string;
  stxAddress: string;
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [txId, setTxId] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [newName, setNewName] = useState<string>('');

  useEffect(() => {
    if (stxAddress) {
      getUserName(stxAddress)
        .catch((e: any) => {
          setStatus('Failed to get name for ' + stxAddress);
          console.log(e);
        })
        .then(async result => {
          console.log(result);
          if (result) {
            setUsername(result.name);
            console.log({ name });
          } else {
            setStatus('No name found for ' + stxAddress);
          }
        });
    }
  }, [stxAddress]);

  const claimAction = async () => {
    setLoading(true);
    let [name, namespace] = username.split('.');
    if (!namespace) {
      namespace = 'btc';
    }
    try {
      setStatus(`Sending transaction`);
      await showContractCall({
        contractAddress: BNSV2_CONTRACT_ADDRESS,
        contractName: BNSV2_CONTRACT_NAME,
        functionName: 'name-claim-fast',
        functionArgs: [
          bufferCVFromString(name),
          bufferCVFromString(namespace),
          principalCV(stxAddress),
        ],
        network: NETWORK,
        anchorMode: AnchorMode.Any,
        postConditionMode: PostConditionMode.Allow,
        onFinish: result => {
          setTxId(result.txId);
          setStatus(resultToStatus(result));
          setLoading(false);
        },
      });
      setStatus(`Sending transaction`);
    } catch (e: any) {
      console.log(e);
      setStatus(e.toString());
      setLoading(false);
    }
  };

  return (
    <div>
      {username.length > 0 ? (
        <Typography>Your primary name: {username}</Typography>
      ) : (
        <>
          <Typography>
            Claim your name on the Nakamoto testnet in seconds! Enter a name ending with .btc and
            tell your friends.
          </Typography>
          <Typography>{title}</Typography>
          <div className="w-72 m-1">
            <Input
              label="Friend's .btc name"
              type="text"
              placeholder={placeholder}
              disabled={username.length > 0}
              value={newName}
              onChange={e => {
                setNewName(e.target.value.trim());
              }}
              onKeyUp={(e: any) => {
                if (e.key === 'Enter') claimAction();
              }}
              onBlur={() => {
                setStatus('');
              }}
            />
          </div>
          <div className="m-1">
            <Button loading={loading} disabled={username.length > 0} onClick={claimAction}>
              Claim
            </Button>
          </div>
          {txId && <TxStatus txId={txId} resultPrefix="Tx id:" />}
          {status && (
            <>
              <div>{status}</div>
            </>
          )}
        </>
      )}
    </div>
  );
}
