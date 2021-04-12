import { ClarityType, cvToString } from '@stacks/transactions';
import { poxCVToBtcAddress } from '../lib/pools-utils';

export default function PoolInfo({ pool }) {
  const useExt = pool.data.contract.type === ClarityType.OptionalNone;
  const contractId = useExt
    ? cvToString(pool.data['extended-contract'].value)
    : cvToString(pool.data.contract.value);

  return (
    <>
      <h5>
        <a href={pool.data.url.data}>
          {pool.data.name.data.name.buffer.toString()}.
          {pool.data.name.data.namespace.buffer.toString()}
        </a>
      </h5>
      <p>
        {contractId}
        <br />
        {pool.data['locking-period'].type === ClarityType.OptionalSome
          ? `Locking for ${cvToString(pool.data['locking-period'].value)} cycles.`
          : 'Variable locking period'}
        <br />
        {pool.data['minimum-ustx'].type === ClarityType.OptionalSome
          ? `${pool.data['minimum-ustx'].value.value.toNumber() / 1000000} STX`
          : 'No minimum STX required'}
        <br />
        {
          pool.data['pox-address'].list.map(address => {
            return (
              <>
                {poxCVToBtcAddress(address)}
                <br />
              </>
            );
          }
        )}
      </p>
    </>
  );
}
