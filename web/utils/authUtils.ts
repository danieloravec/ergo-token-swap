import { backendRequest } from '@utils/utils';
import { type EIP12UnsignedTransaction } from '@fleet-sdk/common';
import { type Wallet } from '@ergo/wallet';

export const obtainJwt = async (
  wallet: Wallet,
  address: string
): Promise<string | undefined> => {
  const authTxData: { body: { unsignedAuthTx: EIP12UnsignedTransaction } } =
    await backendRequest(`/user/auth?address=${address}`);
  if (authTxData.body.unsignedAuthTx === undefined) {
    return undefined;
  }
  const signedTx = await wallet.signTx(authTxData.body.unsignedAuthTx);
  const jwtData: { body: { jwt: string } } = await backendRequest(
    '/user/auth',
    'POST',
    {
      address,
      signedTx,
    }
  );
  return jwtData?.body?.jwt;
};
