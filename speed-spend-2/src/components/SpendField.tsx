import { Button, Input, Typography } from '@material-tailwind/react';
import { showSTXTransfer } from '@stacks/connect';
import { useEffect, useState } from 'react';
import { fetchAccount, getUserAddress } from '../lib/account';
import { NETWORK } from '../lib/constants';
import { TxStatus } from './TxStatus';

export function SpendField({
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
  const [account, setAccount] = useState();
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    if (stxAddress) {
      fetchAccount(stxAddress)
        .catch((e: any) => {
          setStatus('Failed to access your account');
          console.log(e);
        })
        .then(async (acc: any) => {
          setAccount(acc);
          console.log({ acc });
        });
    }
  }, [stxAddress]);

  const sendAction = async () => {
    setTxId('');
    setLoading(true);
    var usernameString = username;
    if (username.indexOf('.') < 0) {
      usernameString = `${username} (${username}.btc)`;
    }

    // check recipient
    const recipient = await getUserAddress(username);
    if (!recipient) {
      setStatus(`Recipient ${usernameString} not found. Please check the username!`);
      setLoading(false);
      return;
    }

    // check balance
    const acc = await fetchAccount(stxAddress);
    const balance = acc ? parseInt(acc.balance, 16) : 0;
    if (balance < 1000) {
      setStatus('Your balance is below 1000 uSTX');
      setLoading(false);
      return;
    }

    console.log('STX address of recipient ' + recipient.address);
    try {
      setStatus(`Sending transaction`);
      await showSTXTransfer({
        recipient: recipient.address,
        amount: 1000n,
        network: NETWORK,

        onFinish: data => {
          console.log(data);
          setStatus('');
          setTxId(data.txId);
          setLoading(false);
        },
        onCancel: () => {
          setStatus('');
          setLoading(false);
        },
      });
    } catch (e: any) {
      console.log(e);
      setStatus(e.toString());
      setLoading(false);
    }
  };

  return (
    <div>
      <Typography>
        Send Test STXs (from your own Stacks address). Ask your friends for their .btc name on
        nakamoto testnet and send them some tSTX.
      </Typography>
      <Typography>{title}</Typography>
      <div className="w-72 m-1">
        <Input
          label="Friend's .btc name"
          type="text"
          placeholder={placeholder}
          disabled={!account}
          value={username}
          onChange={e => {
            setUsername(e.target.value.trim());
          }}
          onKeyUp={(e: any) => {
            if (e.key === 'Enter') sendAction();
          }}
          onBlur={() => {
            setStatus('');
          }}
        />
      </div>
      <div className="m-1">
        <Button loading={loading} onClick={sendAction}>
          Send
        </Button>
      </div>
      {txId && <TxStatus txId={txId} resultPrefix="Tx result:" />}
      {status && (
        <>
          <div>{status}</div>
        </>
      )}
    </div>
  );
}
