import {
  authenticate,
  backendRequest,
  createUserIfNotExists,
} from '@utils/utils';
import { type Wallet } from '@ergo/wallet';
import { type MessageStructure } from '@data-types/messages';

export const loadMessages = async (
  address: string | undefined,
  jwt: string,
  setJwt: (token: string) => void,
  wallet: Wallet | undefined,
  onSuccess: (messages: MessageStructure) => void
): Promise<void> => {
  if (address === undefined) {
    return;
  }
  await createUserIfNotExists(address);
  const authSuccessful = await authenticate(address, jwt, setJwt, wallet);
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
    console.error('Failed to load messages');
  } else {
    onSuccess(messages.body as MessageStructure);
  }
};
