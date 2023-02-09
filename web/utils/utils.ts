import { config } from '@config';

export const backendRequest = async (
  endpoint: string,
  method: string = 'GET',
  body: any = undefined
): Promise<any> => {
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }
  const response = await fetch(`${config.backendUrl}${endpoint}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (response.status !== 200) {
    return {
      status: response.status,
      body: await response.text(),
    };
  }
  return {
    status: response.status,
    body: await response.json(),
  };
};
