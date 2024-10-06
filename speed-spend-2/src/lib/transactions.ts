export function resultToStatus(result: any) {
  if (result && !result.error && result.startsWith('"') && result.length === 66) {
    const txId = result.substr(1, 64);
    return txId;
  } else if (result && result.error) {
    return JSON.stringify(result);
  } else {
    return result.toString();
  }
}
