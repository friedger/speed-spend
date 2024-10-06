import { Spinner, Typography } from '@material-tailwind/react';
import { useEffect, useState } from 'react';
import { STACK_API_URL } from '../lib/constants';

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
