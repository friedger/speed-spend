export function Amount({ ustx }) {
  if (isNaN(ustx)) {
    return ustx;
  }
  return (
    <>
      {(ustx / 1000000).toLocaleString(undefined, {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}
      Ӿ
    </>
  );
}
