import { config } from '@config';
import { type Wallet } from '@ergo/wallet';
import { type ProfileInfo } from '@data-types/profile';
import JSONBig from 'json-bigint';

export const backendRequest = async (
  endpoint: string,
  method: string = 'GET',
  body: any = undefined,
  additionalHeaders: object = {}
): Promise<any> => {
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }
  const response = await fetch(`${config.backendUrl}${endpoint}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...additionalHeaders,
    },
    body: body !== undefined ? JSONBig.stringify(body) : undefined,
  });
  if (response.status !== 200) {
    return {
      status: response.status,
      body: await response.json(),
    };
  }
  return {
    status: response.status,
    body: await response.json(),
  };
};

export async function explorerRequest(
  endpoint: string,
  apiVersion: 0 | 1 = 1
): Promise<any> {
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }
  const res = await fetch(`${config.explorerApiUrl}/v${apiVersion}${endpoint}`);
  return await res.json();
}

export const authenticate = async (
  address: string,
  setJwt: (token: string) => void,
  jwt?: string,
  wallet?: Wallet
): Promise<boolean> => {
  if (wallet === undefined) {
    throw new Error('WALLET_UNDEFINED');
  }

  try {
    await createUserIfNotExists(address);
  } catch (err) {
    console.error(`Creating user failed: ${JSON.stringify(err)}`);
    return false;
  }

  if (jwt !== undefined) {
    const isAuthenticatedRes = await backendRequest(
      '/user/auth/check',
      'POST',
      {
        address,
        jwt,
      }
    );
    if (isAuthenticatedRes.status !== 200) {
      console.error(isAuthenticatedRes);
      return false; // Cannot authenticate, server unavailable, etc
    }
    if (isAuthenticatedRes.body?.isAuthenticated === true) {
      return true;
    }
  }

  // User not authenticated, yet, let's generate them a jwt
  const secretRes = await backendRequest(
    `/user/auth?address=${address}`,
    'GET'
  );
  if (secretRes.status !== 200 || secretRes.body?.secret === undefined) {
    console.error(secretRes);
    return false;
  }
  const secret = secretRes.body.secret as string;
  const signedSecret = await wallet.signData(address, secret);
  const jwtRes = await backendRequest('/user/auth', 'POST', {
    address,
    signature: signedSecret,
  });
  if (jwtRes.status !== 200 || jwtRes.body?.jwt === undefined) {
    console.error(jwtRes);
    return false;
  }
  setJwt(jwtRes.body.jwt as string);
  return true;
};

export const createUserIfNotExists = async (
  address: string
): Promise<ProfileInfo | undefined> => {
  const profileInfoResponse = await backendRequest(`/user?address=${address}`);
  if (profileInfoResponse.status !== 200) {
    if (profileInfoResponse.body.message === 'User not found') {
      const userCreateResponse = await backendRequest('/user', 'POST', {
        address,
      });
      if (userCreateResponse.status !== 200) {
        console.error(JSON.stringify(userCreateResponse));
        return undefined;
      }
      return userCreateResponse.body;
    }
    console.error(profileInfoResponse);
    return undefined;
  }
  return profileInfoResponse.body;
};

export const getCookie = (name: string): string | undefined => {
  return document.cookie
    .split('; ')
    .filter((row) => row.startsWith(`${name}=`))
    .map((c) => c.split('=')[1])[0];
};

export const jsonStringifyBig = (obj: object): string => {
  return JSON.stringify(obj, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
};
