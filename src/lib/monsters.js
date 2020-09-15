import React, { Fragment, useEffect, useState } from 'react';
import {
  cvToString,
  deserializeCV,
  serializeCV,
  tupleCV,
  uintCV,
} from '@blockstack/stacks-transactions';
import {
  accountsApi,
  CONTRACT_ADDRESS,
  MONSTERS_CONTRACT_NAME,
  smartContractsApi,
  transactionsApi,
} from './constants';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';

export function fetchMonsterDetails2(monsterId) {
  console.log(monsterId);
  return fetch(
    `https://stacks-node-api-latest.argon.blockstack.xyz/v2/map_entry/${CONTRACT_ADDRESS}/${MONSTERS_CONTRACT_NAME}/monsters`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `"0x${monsterId}"`,
    }
  ).then(response => response.json());
}

export function fetchMonsterDetails(monsterId) {
  console.log({ monsterId });

  return Promise.all([
    smartContractsApi
      .callReadOnlyFunction({
        stacksAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        functionName: 'owner-of?',
        readOnlyFunctionArgs: {
          sender: CONTRACT_ADDRESS,
          arguments: [serializeCV(uintCV(monsterId)).toString('hex')],
        },
      })
      .then(response =>
        cvToString(deserializeCV(Buffer.from(response.result.substr(2), 'hex')).value)
      ),
    smartContractsApi
      .getContractDataMapEntryRaw({
        stacksAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        mapName: 'monsters',
        key: serializeCV(tupleCV({ 'monster-id': uintCV(monsterId) })).toString('hex'),
      })
      .then(dataMapRaw => dataMapRaw.raw.json())
      .then(dataMap => {
        console.log({ dataMap });
        const metaData = deserializeCV(Buffer.from(dataMap.data.substr(2), 'hex')).value.data;
        return {
          lastMeal: parseInt(metaData['last-meal'].value),
          name: metaData['name'].buffer.toString(),
        };
      }),
  ]).then(result => {
    return { owner: result[0], metaData: result[1] };
  });
}

export async function fetchMarketState() {
  let response = await accountsApi.getAccountTransactions({
    principal: `${CONTRACT_ADDRESS}.market`,
  });
  const transactions = response.results.filter(tx => tx.tx_type === 'contract_call');
  console.log({ transactions });
  return { transactions };
}

export function MarketState() {
  const [marketState, setMarketState] = useState();

  useEffect(() => {
    const subscribe = async () => {
      const marketState = await fetchMarketState();
      setMarketState(marketState);

      const client = await connectWebSocketClient(
        'ws://stacks-node-api-latest.argon.blockstack.xyz/'
      );
      await client.subscribeAddressTransactions(`${CONTRACT_ADDRESS}.market`, async event => {
        console.log(event);

        if (event.tx_status === 'pending') {
          const mempooltx = await transactionsApi.getMempoolTransactionList();
          console.log(mempooltx);
          return;
        } else if (event.tx_status === 'success') {
          const tx = await transactionsApi.getTransactionById({ txId: event.tx_id });
          console.log({ tx });
          const marketState = await fetchMarketState();
          setMarketState(marketState);
        }
      });
    };

    subscribe();
  }, []);

  if (marketState) {
    return (
      <>
        {marketState.transactions.map((tx, key) => {
          if (tx.contract_call.function_name === 'bid') {
            return (
              <Fragment key={key}>
                <div>
                  {tx.contract_call.function_name} for monster{' '}
                  {deserializeCV(
                    Buffer.from(tx.contract_call.function_args[0].hex.substr(2), 'hex')
                  ).value.toString()}{' '}
                  at{' '}
                  {deserializeCV(
                    Buffer.from(tx.contract_call.function_args[1].hex.substr(2), 'hex')
                  ).value.toString()}{' '}
                  uSTX at {tx.burn_block_time_iso}
                </div>
              </Fragment>
            );
          } else {
            return null;
          }
        })}
      </>
    );
  } else {
    return null;
  }
}
