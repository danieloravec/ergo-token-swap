import { type SignedInput } from '@fleet-sdk/common';

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
