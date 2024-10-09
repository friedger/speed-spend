import { Spinner, Typography } from '@material-tailwind/react';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';
import { useEffect, useState } from 'react';
import { STACK_API_URL, STACKS_API_WS_URL, transactionsApi } from '../lib/constants';

export function TxStatus({ txId, resultPrefix }: { txId: string; resultPrefix: string }) {
  const [processingResult, setProcessingResult] = useState<{ loading: boolean; result: any }>({
    loading: false,
    result: undefined,
  });

  useEffect(() => {
    if (!txId) {
      return;
    }
    console.log(txId);
    setProcessingResult({ loading: true, result: undefined });

    let sub: any;
    let client;
    const subscribe = async (txId: string, update: (event: any) => any) => {
      client = await connectWebSocketClient(STACKS_API_WS_URL);
      sub = await client.subscribeTxUpdates(txId, update);
      console.log({ client, sub });
    };

    subscribe(txId, async (event: any) => {
      console.log(event);
      let result;
      if (event.tx_status === 'pending') {
        return;
      } else if (event.tx_status === 'success') {
        const tx: any = await transactionsApi.getTransactionById({ txId });
        console.log(tx);
        result = tx.tx_result;
      } else if (event.tx_status.startsWith('abort')) {
        result = undefined;
      }
      setProcessingResult({ loading: false, result });
      await sub.unsubscribe();
    });
  }, [txId]);

  if (!txId) {
    return null;
  }

  const normalizedTxId = txId.startsWith('0x') ? txId : `0x${txId}`;
  return (
    <>
      {processingResult.loading && (
        <div className="flex">
          <Spinner className="m-1" />
          <Typography>
            Checking transaction status:{' '}
            <a
              href={`https://explorer.hiro.so/txid/${normalizedTxId}?chain=testnet&api=${STACK_API_URL}`}
            >
              {normalizedTxId}
            </a>
          </Typography>
        </div>
      )}
      {!processingResult.loading && processingResult.result && (
        <Typography>
          {resultPrefix}
          {processingResult.result.repr}
        </Typography>
      )}
    </>
  );
}
