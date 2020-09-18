import React, { useEffect, useRef, useState } from 'react';
import {
  cvToString,
  deserializeCV,
  PostConditionMode,
  serializeCV,
  tupleCV,
  uintCV,
} from '@blockstack/stacks-transactions';
import {
  accountsApi,
  CONTRACT_ADDRESS,
  MONSTERS_CONTRACT_NAME,
  NETWORK,
  smartContractsApi,
  transactionsApi,
} from './constants';
import { useConnect } from '@blockstack/connect';
import { connectWebSocketClient } from '@stacks/blockchain-api-client';
import { TxStatus } from './transactions';
import { principalCV } from '@blockstack/stacks-transactions/lib/clarity/types/principalCV';

export async function fetchMonsterIds(ownerStxAddress) {
  return accountsApi
    .getAccountAssets({ principal: ownerStxAddress })
    .then(assetList => {
      console.log({ assetList });
      return assetList;
    })
    .then(assetList =>
      assetList.results
        .filter(
          a =>
            a.event_type === 'non_fungible_token_asset' &&
            a.asset.asset_id === `${CONTRACT_ADDRESS}.monsters::nft-monsters`
        )
        .map(a => a.asset.value.hex)
    )
    .then(idsHex => [...new Set(idsHex)]);
}
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
    smartContractsApi
      .callReadOnlyFunction({
        stacksAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        functionName: 'is-alive',
        readOnlyFunctionArgs: {
          sender: CONTRACT_ADDRESS,
          arguments: [serializeCV(uintCV(monsterId)).toString('hex')],
        },
      })
      .then(response =>
        cvToString(deserializeCV(Buffer.from(response.result.substr(2), 'hex')).value)
      ),
  ]).then(result => {
    return { owner: result[0], metaData: result[1], alive: result[2] };
  });
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
    fetchMonsterIds(ownerStxAddress)
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

  const monsterIdCV = deserializeCV(
    Buffer.from(tx.contract_call.function_args[0].hex.substr(2), 'hex')
  );
  const amountCV = deserializeCV(
    Buffer.from(tx.contract_call.function_args[1].hex.substr(2), 'hex')
  );
  const sender = principalCV(tx.sender_address);

  const acceptAction = async () => {
    spinner.current.classList.remove('d-none');

    try {
      setStatus(`Sending transaction`);

      doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'market',
        functionName: 'accept',
        functionArgs: [monsterIdCV, sender],
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
      monsterId => monsterId.substr(2) === serializeCV(monsterIdCV).toString('hex')
    );

  return (
    <div className="mb-4">
      Bid for monster {monsterIdCV.value.toString()} at {amountCV.value.toString()} uSTX at{' '}
      {tx.burn_block_time_iso}
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

  const monsterIdCV = deserializeCV(
    Buffer.from(tx.contract_call.function_args[0].hex.substr(2), 'hex')
  );

  const bidOwnerCV = deserializeCV(
    Buffer.from(tx.contract_call.function_args[1].hex.substr(2), 'hex')
  );

  const payAction = async () => {
    spinnerPay.current.classList.remove('d-none');

    try {
      setStatus(`Sending transaction`);

      doContractCall({
        contractAddress: CONTRACT_ADDRESS,
        contractName: 'market',
        functionName: 'pay',
        functionArgs: [monsterIdCV],
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
        functionArgs: [monsterIdCV, bidOwnerCV],
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
      monsterId => monsterId.substr(2) === serializeCV(monsterIdCV).toString('hex')
    );
  return (
    <div className="mb-4">
      Accepted bid for monster {monsterIdCV.value.toString()} placed by user{' '}
      {cvToString(bidOwnerCV)}. Accepted at {tx.burn_block_time_iso}
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
  return (
    <div className="mb-4">
      Paid{' '}
      {deserializeCV(
        Buffer.from(tx.contract_call.function_args[1].hex.substr(2), 'hex')
      ).value.toString()}{' '}
      uSTX for monster{' '}
      {deserializeCV(
        Buffer.from(tx.contract_call.function_args[0].hex.substr(2), 'hex')
      ).value.toString()}{' '}
      at {tx.burn_block_time_iso}
    </div>
  );
}
