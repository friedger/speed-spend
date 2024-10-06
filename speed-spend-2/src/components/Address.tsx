export const Address = ({ address }: { address: string }) => {
  if (address.length > 8) {
    return (
      <>
        {address.substring(0, 4)}...{address.substring(address.length - 4, address.length)}
      </>
    );
  } else {
    return <>{address}</>;
  }
};
