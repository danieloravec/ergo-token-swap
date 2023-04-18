import { type SignedInput } from '@fleet-sdk/common';
import { backendRequest } from '@utils/utils';

export const combineSignedInputs = (
  signedInputsA: SignedInput[],
  signedInputsB: SignedInput[],
  inputIndicesA: number[],
  inputIndicesB: number[]
): SignedInput[] => {
  const combinedInputs = [...signedInputsA, ...signedInputsB]; // Wrong order now, let's fix it
  inputIndicesA.forEach((inputIndex, i) => {
    combinedInputs[inputIndex] = signedInputsA[i];
  });
  inputIndicesB.forEach((inputIndex, i) => {
    combinedInputs[inputIndex] = signedInputsB[i];
  });
  return combinedInputs;
};

export const fetchFinishedTxId = async (
  tradingSessionId: string
): Promise<string | undefined> => {
  const isFinishedResponse = await backendRequest(
    `/tx?secret=${tradingSessionId}`
  );
  if (
    isFinishedResponse.status !== 200 ||
    isFinishedResponse?.body?.submitted === undefined
  ) {
    console.error('Failed to get isFinished');
    return undefined;
  } else if (isFinishedResponse.body.submitted === true) {
    return isFinishedResponse.body.txId;
  }
  return undefined;
};
