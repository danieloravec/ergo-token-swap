import { backendRequest } from '@utils/utils';

export const markMessage = async (
  messageId: number,
  seen: boolean,
  jwt: string
): Promise<boolean> => {
  const markRes = await backendRequest(
    `/message/seen?id=${messageId}`,
    'PUT',
    { seen },
    { Authorization: `Bearer ${jwt}` }
  );
  return markRes.status === 200;
};
