import {
    ClarityType,
    cvToHex,
    cvToString,
    hexToCV,
    ResponseErrorCV,
    ResponseOkCV,
    uintCV,
  } from '@stacks/transactions';
  import { smartContractsApi, CONTRACT_ADDRESS, MONSTERS_CONTRACT_NAME } from './constants';
  
  /**
   * Fetch the list of participants in the competition.
   * @returns Array of participant addresses.
   */
  export async function fetchParticipants(): Promise<string[]> {
    try {
      const response = await smartContractsApi.callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        functionName: 'get-participants', // Ensure this Clarity function exists in your contract
        readOnlyFunctionArgs: {
          sender: CONTRACT_ADDRESS,
          arguments: [],
        },
      });
  
      if (response.result) {
        const responseCV = hexToCV(response.result) as ResponseOkCV;
        if (responseCV.type === ClarityType.ResponseOk) {
          const participants = (responseCV.value as any).list; // Adjust based on the contract output type
          return participants.map((participant: any) => cvToString(participant));
        }
      }
  
      throw new Error('Failed to fetch participants.');
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }
  
  /**
   * Fetch the tenure of a specific participant.
   * @param participantId - The participant's unique ID.
   * @returns The tenure as a number.
   */
  export async function fetchTenure(participantId: bigint): Promise<number> {
    try {
      const response = await smartContractsApi.callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: MONSTERS_CONTRACT_NAME,
        functionName: 'get-tenure', // Ensure this Clarity function exists in your contract
        readOnlyFunctionArgs: {
          sender: CONTRACT_ADDRESS,
          arguments: [cvToHex(uintCV(participantId))],
        },
      });
  
      if (response.result) {
        const responseCV = hexToCV(response.result) as ResponseOkCV | ResponseErrorCV;
        if (responseCV.type === ClarityType.ResponseOk) {
          const valueCV = responseCV.value;
          if (valueCV.type === ClarityType.UInt) {
            return Number(valueCV.value); // Convert to a number safely
          }
        }
      }
  
      throw new Error('Failed to fetch tenure.');
    } catch (error) {
      console.error(`Error fetching tenure for participant ID ${participantId}:`, error);
      return 0;
    }
  }
  