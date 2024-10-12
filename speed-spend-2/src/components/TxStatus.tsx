import { Progress, Typography } from '@material-tailwind/react';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';
import { useEffect, useState } from 'react';
import { STACK_API_URL, STACKS_SOCKET_URL, transactionsApi } from '../lib/constants';

function Ticker({ txId }: { txId: string }) {
  const [startTime, setStartTime] = useState(new Date());
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setStartTime(new Date());
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [txId]);

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between gap-4">
        <Typography color="blue-gray" variant="h6">
          {Math.floor((time.getTime() - startTime.getTime()) / 1000)} sec
        </Typography>
        <Typography color="blue-gray" variant="h6">
          20 sec
        </Typography>
      </div>
      <Progress value={Math.floor((time.getTime() - startTime.getTime()) / 1000) * 5} />
    </div>
  );
}

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
        <>
          <Ticker txId={txId} />
          <div className="flex">
            <Typography>
              Checking transaction status:{' '}
              <a
                href={`https://explorer.hiro.so/txid/${normalizedTxId}?chain=testnet&api=${STACK_API_URL}`}
              >
                {normalizedTxId}
              </a>
            </Typography>
          </div>
        </>
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
