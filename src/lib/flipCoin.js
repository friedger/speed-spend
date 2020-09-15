import { cvToString, deserializeCV, serializeCV, uintCV } from '@blockstack/stacks-transactions';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';
import React, { useState, useEffect } from 'react';
import { CONTRACT_ADDRESS, NETWORK, ARGON_API_URL } from './constants';
import { accountsApi, smartContractsApi, transactionsApi } from './constants';

export async function fetchAtTwoState() {
  let response = await accountsApi.getAccountTransactions({
    principal: `${CONTRACT_ADDRESS}.flip-coin-at-two`,
  });
  const txs = response.results.filter(
    tx =>
      tx.tx_type === 'contract_call' &&
      tx.contract_call.function_name === 'bet' &&
      tx.events.length === 3
  );
  console.log(txs);
  const lastPayout = txs.length > 0 ? txs[0].burn_block_time_iso : 0;
  const lastWinner =
    txs.length > 0
      ? txs[0].events.filter(
          e =>
            e.asset.recipient !== `${CONTRACT_ADDRESS}.flip-coin-at-two` &&
            e.asset.recipient !== `${CONTRACT_ADDRESS}.flip-coin-jackpot`
        )[0].asset
      : undefined;

  const resp = await smartContractsApi.callReadOnlyFunctionRaw({
    stacksAddress: CONTRACT_ADDRESS,
    contractName: 'flip-coin-at-two',
    functionName: 'get-next-slot',
    readOnlyFunctionArgs: { sender: CONTRACT_ADDRESS, arguments: [] },
  });
  const nextSlotCVJson = await resp.raw.json();
  const nextSlotData = deserializeCV(Buffer.from(nextSlotCVJson.result.substr(2), 'hex')).data;
  console.log({ nextSlotData });

  const nextSlot = {
    amount: nextSlotData.amount.value.toString(),
    betFalse:
      nextSlotData['bet-false'].type === 9
        ? undefined
        : cvToString(nextSlotData['bet-false'].value),
    betTrue:
      nextSlotData['bet-true'].type === 9 ? undefined : cvToString(nextSlotData['bet-true'].value),
  };
  console.log({ nextSlot });
  return { nextSlot, lastPayout, lastWinner };
}

export function AtTwoState() {
  const [atTwoState, setAtTwoState] = useState();

  useEffect(() => {
    const subscribe = async () => {
      const atTwoState = await fetchAtTwoState();
      setAtTwoState(atTwoState);

      const client = await connectWebSocketClient(
        'ws://stacks-node-api-latest.argon.blockstack.xyz/'
      );
      await client.subscribeAddressTransactions(
        `${CONTRACT_ADDRESS}.flip-coin-at-two`,
        async event => {
          console.log(event);

          if (event.tx_status === 'pending') {
            const mempooltx = await transactionsApi.getMempoolTransactionList();
            console.log(mempooltx);
            return;
          } else if (event.tx_status === 'success') {
            const tx = await transactionsApi.getTransactionById({ txId: event.tx_id });
            console.log({ tx });
            const atTwoState = await fetchAtTwoState();
            setAtTwoState(atTwoState);
          }
        }
      );
    };

    subscribe();
  }, []);

  if (atTwoState) {
    return (
      <>
        <div>Player Seats "HEAD": {atTwoState.nextSlot.betTrue || 'Free Seat'} </div>
        <div>Player Seats "TAILS": {atTwoState.nextSlot.betFalse || 'Free Seat'} </div>
        {atTwoState.lastWinner && (
          <div className="mt-5">
            Last Payout: {atTwoState.lastPayout} - {atTwoState.lastWinner.amount}uSTX
            <br />
            Last Winner: {atTwoState.lastWinner.recipient}
          </div>
        )}
      </>
    );
  } else {
    return null;
  }
}

export async function fetchJackpotState() {
  let response = await accountsApi.getAccountTransactions({
    principal: `${CONTRACT_ADDRESS}.flip-coin-jackpot`,
  });

  const txs = response.results.filter(
    tx =>
      tx.tx_type === 'contract_call' &&
      tx.contract_call.function_name === 'bet' &&
      tx.events.length === 2
  );
  console.log(txs);
  const lastPayout = txs.length > 0 ? txs[0].burn_block_time_iso : 0;
  const lastWinner =
    txs.length > 0
      ? txs[0].events.filter(e => e.asset.recipient !== `${CONTRACT_ADDRESS}.flip-coin-jackpot`)[0]
          .asset
      : undefined;
  return { lastPayout, lastWinner };
}

export function JackpotState() {
  const [jackpotState, setJackpotState] = useState();

  useEffect(() => {
    const subscribe = async () => {
      const jackpotState = await fetchJackpotState();
      setJackpotState(jackpotState);

      const client = await connectWebSocketClient(
        'ws://stacks-node-api-latest.argon.blockstack.xyz/'
      );
      await client.subscribeAddressTransactions(
        `${CONTRACT_ADDRESS}.flip-coin-jackpot`,
        async event => {
          console.log(event);

          if (event.tx_status === 'pending') {
            const mempooltx = await transactionsApi.getMempoolTransactionList();
            console.log(mempooltx);
            return;
          } else if (event.tx_status === 'success') {
            const tx = await transactionsApi.getTransactionById({ txId: event.tx_id });
            console.log({ tx });
            const jackpotState = await fetchJackpotState();
            setJackpotState(jackpotState);
          }
        }
      );
    };

    subscribe();
  }, []);

  if (jackpotState) {
    return (
      <>
        {jackpotState.lastWinner && (
          <div className="mt-5">
            Last Payout: {jackpotState.lastPayout} - {jackpotState.lastWinner.amount}uSTX
            <br />
            Last Winner: {jackpotState.lastWinner.recipient}
          </div>
        )}
      </>
    );
  } else {
    return null;
  }
}

export function fetchJackpot(sender) {
  return fetch(
    `${NETWORK.coreApiUrl}/v2/contracts/call-read/${CONTRACT_ADDRESS}/flip-coin-jackpot/get-jackpot`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `{"sender":"${sender}","arguments":[]}`,
    }
  )
    .then(response => response.json())
    .then(getJackpot => {
      console.log({ getJackpot });
      if (getJackpot.okay) {
        const cv = deserializeCV(Buffer.from(getJackpot.result.substr(2), 'hex'));
        if (cv.value) {
          return cv.value;
        } else {
          return undefined;
        }
      }
    });
}

export function fetchWinnerAt(sender, height) {
  return fetch(
    `${ARGON_API_URL}/v2/contracts/call-read/${CONTRACT_ADDRESS}/flip-coin-jackpot/get-optional-winner-at`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: `{"sender":"${sender}","arguments":["${serializeCV(uintCV(height)).toString('hex')}"]}`,
    }
  )
    .then(response => response.json())
    .then(optionalWinner => {
      console.log({ optionalWinner });
      if (optionalWinner.okay) {
        const cv = deserializeCV(Buffer.from(optionalWinner.result.substr(2), 'hex'));
        if (cv.value) {
          return cv.value;
        } else {
          return undefined;
        }
      }
    });
}
