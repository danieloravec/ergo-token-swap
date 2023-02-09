import { config } from '@config';

export const backendRequest = async (endpoint: string): Promise<any> => {
  if (!endpoint.startsWith('/')) {
    endpoint = `/${endpoint}`;
  }
  const response = await fetch(`${config.backendUrl}${endpoint}`);
  return await response.json();
};
