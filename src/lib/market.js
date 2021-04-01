import React, { useEffect, useRef, useState } from 'react';
import {
  cvToString,
  PostConditionMode,
  serializeCV,
  standardPrincipalCV,
} from '@stacks/transactions';
import {
  accountsApi,
  CONTRACT_ADDRESS,
  NETWORK,
  STACKS_API_WS_URL,
  transactionsApi,
} from './constants';
import { useConnect } from '../lib/auth';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';
import { hexToCV, TxStatus } from './transactions';
import { fetchNFTIds } from './nft';

export async function fetchNFTs(ownerStxAddress) {
  let response = await accountsApi.getAccountTransactions({
    principal: `${CONTRACT_ADDRESS}.market`,
  });
  const transactions = response.results.filter(
    tx =>
      tx.tx_type === 'contract_call' &&
      tx.tx_status === 'success' &&
      tx.contract_call.function_name === 'offer-tradable'
  );
  console.log({ transactions });
  return transactions;
}

export async function fetchMarketState() {
  let response = await accountsApi.getAccountTransactions({
    principal: `${CONTRACT_ADDRESS}.market`,
  });
  const transactions = response.results.filter(
    tx => tx.tx_type === 'contract_call' && tx.tx_status === 'success'
  );
  console.log({ transactions });
  return { transactions };
}

export function MarketState({ ownerStxAddress }) {
  const [marketState, setMarketState] = useState();
  const [ownedMonsterIds, setOwnedMonsterIds] = useState();

  useEffect(() => {
    fetchNFTIds(ownerStxAddress, `${CONTRACT_ADDRESS}.monster::nft-monsters`)
      .then(async monsterIds => {
        console.log({ monsterIds });
        setOwnedMonsterIds(monsterIds);
      })
      .catch(e => {
        console.log(e);
      });

    const subscribe = async () => {
      const marketState = await fetchMarketState();
      setMarketState(marketState);

      const client = await connectWebSocketClient(STACKS_API_WS_URL);
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
  }, [ownerStxAddress]);

  if (marketState && marketState.transactions.length > 0) {
    return (
      <>
        <h5>Recent activities on the marketplace</h5>
        {marketState.transactions.map((tx, key) => {
          if (tx.contract_call.function_name === 'bid') {
            return <BidTransaction key={key} tx={tx} ownedMonsterIds={ownedMonsterIds} />;
          } else if (tx.contract_call.function_name === 'accept') {
            return (
              <AcceptTransaction
                key={key}
                tx={tx}
                ownedMonsterIds={ownedMonsterIds}
                ownerStxAddress={ownerStxAddress}
              />
            );
          } else if (tx.contract_call.function_name === 'pay') {
            return <PayTransaction key={key} tx={tx} />;
          } else if (tx.contract_call.function_name === 'cancel') {
            return <CancelTransaction key={key} tx={tx} />;
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

export function BidTransaction({ tx, ownedMonsterIds }) {
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const spinner = useRef();
  const { doContractCall } = useConnect();

  const tradableCV = hexToCV(tx.contract_call.function_args[0].hex);

  const tradableIdCV = hexToCV(tx.contract_call.function_args[1].hex);

  const amountCV = hexToCV(tx.contract_call.function_args[2].hex);

  const sender = standardPrincipalCV(tx.sender_address);

  const acceptAction = async () => {
    spinner.current.classList.remove('d-none');

    try {
      setStatus(`Sending transaction`);

      doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'market',
        functionName: 'accept',
        functionArgs: [tradableCV, tradableIdCV, sender],
        network: NETWORK,
        postConditions: [],
        postConditionMode: PostConditionMode.Allow,
        finished: result => {
          console.log(result);
          spinner.current.classList.add('d-none');
          setTxId(result.txId);
          setStatus(undefined);
        },
      });
    } catch (e) {
      console.log(e);
      setStatus(e.toString());
      spinner.current.classList.add('d-none');
    }
  };

  const isOwned =
    ownedMonsterIds &&
    ownedMonsterIds.find(
      monsterId => monsterId.substr(2) === serializeCV(tradableIdCV).toString('hex')
    );

  return (
    <div className="mb-4">
      Bid for tradable {cvToString(tradableCV)} with id {tradableIdCV.value.toString()} at{' '}
      {amountCV.value.toString()} uSTX at {tx.burn_block_time_iso} by user {cvToString(sender)}
      {isOwned && (
        <>
          <div className="NoteField input-group ">
            <div className="input-group-append">
              <button className="btn btn-outline-secondary" type="button" onClick={acceptAction}>
                <div
                  ref={spinner}
                  role="status"
                  className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
                />
                Accept
              </button>
            </div>
          </div>
          <TxStatus txId={txId} />
          {status && <div>{status}</div>}
        </>
      )}
    </div>
  );
}

export function AcceptTransaction({ tx, ownedMonsterIds, ownerStxAddress }) {
  const [status, setStatus] = useState();
  const [txId, setTxId] = useState();
  const spinnerPay = useRef();
  const spinnerCancel = useRef();
  const { doContractCall } = useConnect();

  const tradableCV = hexToCV(tx.contract_call.function_args[0].hex);
  const tradableIdCV = hexToCV(tx.contract_call.function_args[1].hex);
  const bidOwnerCV = hexToCV(tx.contract_call.function_args[2].hex);

  const payAction = async () => {
    spinnerPay.current.classList.remove('d-none');

    try {
      setStatus(`Sending transaction`);

      doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'market',
        functionName: 'pay',
        functionArgs: [tradableCV, tradableIdCV],
        network: NETWORK,
        postConditions: [],
        postConditionMode: PostConditionMode.Allow,
        finished: result => {
          console.log(result);
          spinnerPay.current.classList.add('d-none');
          setTxId(result.txId);
          setStatus(undefined);
        },
      });
    } catch (e) {
      console.log(e);
      setStatus(e.toString());
      spinnerPay.current.classList.add('d-none');
    }
  };

  const cancelAction = async () => {
    spinnerCancel.current.classList.remove('d-none');

    try {
      setStatus(`Sending transaction`);

      doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'market',
        functionName: 'cancel',
        functionArgs: [tradableCV, tradableIdCV, bidOwnerCV],
        network: NETWORK,
        postConditions: [],
        postConditionMode: PostConditionMode.Allow,
        finished: result => {
          console.log(result);
          spinnerCancel.current.classList.add('d-none');
          setTxId(result.txId);
          setStatus(undefined);
        },
      });
    } catch (e) {
      console.log(e);
      setStatus(e.toString());
      spinnerCancel.current.classList.add('d-none');
    }
  };

  const isBidder = cvToString(bidOwnerCV) === ownerStxAddress;

  const isOwned =
    ownedMonsterIds &&
    ownedMonsterIds.find(
      monsterId => monsterId.substr(2) === serializeCV(tradableIdCV).toString('hex')
    );
  return (
    <div className="mb-4">
      Accepted bid for {cvToString(tradableCV)} with id {tradableIdCV.value.toString()} placed by
      user {cvToString(bidOwnerCV)}. Accepted at {tx.burn_block_time_iso}
      <>
        {isBidder && (
          <div className="NoteField input-group ">
            <div className="input-group-append">
              <button className="btn btn-outline-secondary" type="button" onClick={payAction}>
                <div
                  ref={spinnerPay}
                  role="status"
                  className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
                />
                Pay
              </button>
            </div>
          </div>
        )}
        {isOwned && (
          <div className="NoteField input-group ">
            <div className="input-group-append">
              <button className="btn btn-outline-secondary" type="button" onClick={cancelAction}>
                <div
                  ref={spinnerCancel}
                  role="status"
                  className="d-none spinner-border spinner-border-sm text-info align-text-top mr-2"
                />
                Cancel Sale
              </button>
            </div>
          </div>
        )}
        <TxStatus txId={txId} />
        {status && <div>{status}</div>}
      </>
    </div>
  );
}

export function PayTransaction({ tx }) {
  const amount = tx.events.filter(e => e.event_type === 'stx_asset')[0].asset.amount;
  return (
    <div className="mb-4">
      Paid {amount} uSTX for tradable {cvToString(hexToCV(tx.contract_call.function_args[0].hex))}{' '}
      with id {hexToCV(tx.contract_call.function_args[1].hex).value.toString()} at{' '}
      {tx.burn_block_time_iso}
    </div>
  );
}

export function CancelTransaction({ tx }) {
  return (
    <div className="mb-4">
      Cancelled deal for tradable {cvToString(hexToCV(tx.contract_call.function_args[0].hex))} with
      id {hexToCV(tx.contract_call.function_args[1].hex).value.toString()} at{' '}
      {tx.burn_block_time_iso}
    </div>
  );
}
