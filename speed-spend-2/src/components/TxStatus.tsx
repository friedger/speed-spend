import { Spinner, Typography } from '@material-tailwind/react';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';
import { useEffect, useState } from 'react';
import { STACK_API_URL, STACKS_SOCKET_URL, transactionsApi } from '../lib/constants';

export function TxStatus({ txId, resultPrefix }: { txId: string; resultPrefix: string }) {
  const [processingResult, setProcessingResult] = useState<{ loading: boolean; result: any }>({
    loading: false,
    result: undefined,
  });

  useEffect(() => {
    if (!txId) {
      return;
    }
    console.log('subscribed to', txId);
    setProcessingResult({ loading: true, result: undefined });

    let sub: any;
    const subscribe = async (txId: string, update: (transaction: any) => any) => {
      let sc = await connectWebSocketClient(STACKS_SOCKET_URL);
      if (sub) {
        console.log('unsubscribing ', sub);
        sub.unsubscribe();
      }
      sub = await sc.subscribeTxUpdates(txId, update);
      console.log({ sub });
    };

    subscribe(txId, async (transaction: any) => {
      console.log(transaction);
      let result;
      if (transaction.tx_status === 'pending') {
        return;
      } else if (transaction.tx_status === 'success') {
        const tx: any = await transactionsApi.getTransactionById({ txId });
        console.log(tx);
        result = tx.tx_result;
      } else if (transaction.tx_status.startsWith('abort')) {
        result = undefined;
      }
      setProcessingResult({ loading: false, result });
      await sub.unsubscribe();
      sub = undefined;
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
