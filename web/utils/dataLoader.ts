import { authenticate, backendRequest } from '@utils/utils';
import { type Wallet } from '@ergo/wallet';
import { type MessageStructure } from '@data-types/messages';

export const loadMessages = async (
  address: string | undefined,
  setJwt: (token: string) => void,
  wallet: Wallet | undefined,
  onSuccess: (messages: MessageStructure) => void,
  jwt?: string
): Promise<void> => {
  if (address === undefined) {
    return;
  }
  const authSuccessful = await authenticate(address, setJwt, jwt, wallet);
  if (!authSuccessful) {
    console.error('Authentication failed');
    return;
  }
  const messages = await backendRequest(
    `/message?address=${address}`,
    'GET',
    undefined,
    { Authorization: jwt }
  );
  if (messages.status !== 200 || messages.body === undefined) {
    console.error('MESSAGE_LOADING_FAILED');
  } else {
    onSuccess(messages.body as MessageStructure);
  }
};
