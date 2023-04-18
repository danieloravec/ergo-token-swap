import { FlexDiv } from '@components/Common/Alignment';
import { Heading1, Input, Textarea } from '@components/Common/Text';
import { ButtonSecondary } from '@components/Common/Button';
import styled from 'styled-components';
import React, { useEffect } from 'react';
import { useWalletStore } from '@components/Wallet/hooks';
import { WalletNotConnected } from '@components/Common/WalletNotConnected';
import NoSsr from '@components/Common/NoSsr';
import { authenticate, backendRequest } from '@utils/utils';
import { Alert } from '@components/Common/Alert';
import { useJwtAuth } from '@components/hooks';
import { useRouter } from 'next/router';

const MessageFormContainer = styled(FlexDiv)`
  width: 100%;
  @media (min-width: 600px) {
    width: 80%;
  }
  @media (min-width: 1000px) {
    width: 50%;
  }
`;

const WideFlexDiv = styled(FlexDiv)`
  width: 100%;
`;

const WideInput = styled(Input)`
  width: 100%;
  margin: 10px 0 10px 0;
  min-height: 50px;
  font-size: 24px;
`;

const WideTextarea = styled(Textarea)`
  width: 100%;
  font-size: 24px;
  margin: 10px 0 10px 0;
`;

const SendMessagePage = (): JSX.Element => {
  const { address } = useWalletStore();
  const { wallet } = useWalletStore();
  const { jwt, setJwt } = useJwtAuth();
  const router = useRouter();

  const [error, setError] = React.useState<string | undefined>(undefined);
  const [success, setSuccess] = React.useState<string | undefined>(undefined);
  const [receiver, setReceiver] = React.useState<string | undefined>(undefined);
  const [subject, setSubject] = React.useState<string | undefined>(undefined);
  const [message, setMessage] = React.useState<string | undefined>(undefined);

  useEffect(() => {
    const prefilledRecipient = router.query?.recipient;
    if (prefilledRecipient !== undefined) {
      setReceiver(prefilledRecipient as string);
    }
    const prefilledSubject = router.query?.subject;
    if (prefilledSubject !== undefined) {
      setSubject(
        Buffer.from(prefilledSubject as string, 'hex').toString('utf-8')
      );
    }
  });

  useEffect(() => {
    const performAuth = async (): Promise<void> => {
      if (address === undefined) {
        return;
      }
      const authSuccessful = await authenticate(address, setJwt, jwt, wallet);
      if (!authSuccessful) {
        setError('Authentication failed');
      }
    };
    performAuth().catch(console.error);
  });

  if (address === undefined) {
    return (
      <NoSsr>
        <WalletNotConnected />
      </NoSsr>
    );
  }

  const handleMessageSend = async (): Promise<void> => {
    setSuccess(undefined);
    setError(undefined);

    const messageSendRes = await backendRequest(
      '/message',
      'POST',
      {
        fromAddress: address,
        toAddress: receiver,
        subject,
        text: message,
      },
      {
        Authorization: jwt,
      }
    );
    if (messageSendRes.status !== 200) {
      setError(`Message send failed: ${JSON.stringify(messageSendRes.body)}`);
    } else {
      setSuccess('Message sent successfully');
    }
  };

  return (
    <NoSsr>
      <MessageFormContainer>
        {error !== undefined && <Alert type="error">{error}</Alert>}
        {success !== undefined && <Alert type="success">{success}</Alert>}
        <Heading1>SEND A MESSAGE</Heading1>
        <WideFlexDiv>
          <WideInput
            placeholder="Receiver address"
            value={receiver ?? ''}
            onChange={(e) => {
              setReceiver(e.target.value);
            }}
          />
        </WideFlexDiv>
        <WideFlexDiv>
          <WideInput
            placeholder="Subject"
            value={subject ?? ''}
            onChange={(e) => {
              setSubject(e.target.value);
            }}
          />
        </WideFlexDiv>
        <WideTextarea
          rows={10}
          placeholder="Message"
          onChange={(e) => {
            setMessage(e.target.value);
          }}
        />
        <WideFlexDiv>
          <ButtonSecondary
            style={{ width: '100%' }}
            onClick={() => {
              handleMessageSend().catch(console.error);
            }}
          >
            Send
          </ButtonSecondary>
        </WideFlexDiv>
      </MessageFormContainer>
    </NoSsr>
  );
};

export default SendMessagePage;
