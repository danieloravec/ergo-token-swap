import { useEffect, useState } from 'react';
import { type Message, type MessageStructure } from '@data-types/messages';
import { useWalletStore } from '@components/Wallet/hooks';
import { useJwtAuth } from '@components/hooks';
import { Heading1, Text } from '@components/Common/Text';
import { MessageList } from '@components/Messages/MessageList';
import { FlexDiv } from '@components/Common/Alignment';
import styled, { useTheme } from 'styled-components';
import { Toggle } from '@components/Common/Toggle';
import { ButtonTertiary } from '@components/Common/Button';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { useRouter } from 'next/router';
import { loadMessages } from '@utils/dataLoader';
import NoSsr from '@components/Common/NoSsr';
import { backendRequest } from '@utils/utils';

type MessageType = 'received' | 'sent';

const Container = styled(FlexDiv)`
  width: 100%;

  @media (min-width: 600px) {
    width: 80%;
  }

  @media (min-width: 1000px) {
    width: 70%;
  }

  @media (min-width: 1600px) {
    width: 50%;
  }
`;

const ViewMessages = (): JSX.Element => {
  const theme = useTheme();
  const router = useRouter();

  const { address, wallet } = useWalletStore();
  const { jwt, setJwt } = useJwtAuth();
  const [type, setType] = useState<MessageType>('received');
  const [isLoaded, setIsLoaded] = useState(false);

  const [messages, setMessages] = useState<MessageStructure | undefined>();

  useEffect(() => {
    loadMessages(
      address,
      setJwt,
      wallet,
      (messages: MessageStructure) => {
        setMessages(messages);
        setIsLoaded(true);
      },
      jwt
    ).catch(console.error);
  }, [address, jwt, isLoaded]);

  const handleMessageArchivation = (id: number): void => {
    const archiveMessage = async (messageId: number): Promise<void> => {
      const archivationResult = await backendRequest(
        `/message/archive?id=${id}`,
        'PUT',
        undefined,
        {
          Authorization: `Bearer ${jwt}`,
        }
      );
      if (archivationResult.status !== 200) {
        console.error(
          `Error deleting message: ${JSON.stringify(archivationResult)}`
        );
      } else {
        if (messages === undefined) {
          return;
        }
        const newSent = messages.sent.filter(
          (m: Message) => m.id !== messageId
        );
        const newReceived = messages.received.filter(
          (m: Message) => m.id !== messageId
        );
        setMessages({
          sent: newSent,
          received: newReceived,
        });
      }
    };
    archiveMessage(id).catch(console.error);
  };

  if (address === undefined) {
    return (
      <NoSsr>
        <FlexDiv>
          <Text>Please connect your wallet to view your messages.</Text>
        </FlexDiv>
      </NoSsr>
    );
  }

  if (!isLoaded) {
    return (
      <NoSsr>
        <Text>Loading messages...</Text>
      </NoSsr>
    );
  }

  return (
    <Container>
      <FlexDiv style={{ width: '100%' }}>
        <FlexDiv style={{ marginRight: 'auto' }}>
          {type === 'received' && (
            <Heading1>
              <span style={{ color: theme.properties.colorPrimary }}>
                Received
              </span>{' '}
              messages
            </Heading1>
          )}
          {type !== 'received' && (
            <Heading1>
              <span style={{ color: theme.properties.colorSecondary }}>
                Sent
              </span>{' '}
              messages
            </Heading1>
          )}
        </FlexDiv>
        <FlexDiv style={{ marginLeft: 'auto' }}>
          <FlexDiv style={{ marginTop: 'auto', marginBottom: 'auto' }}>
            <ButtonTertiary
              onClick={() => {
                router.push('/messages/send').catch(console.error);
              }}
            >
              + New
            </ButtonTertiary>
          </FlexDiv>
          <Spacer size={spacing.spacing_s} vertical={false} />
          <Toggle
            leftOption="Received"
            rightOption="Sent"
            onToggle={(toggledToSide) => {
              setType(toggledToSide === 'left' ? 'received' : 'sent');
            }}
          />
        </FlexDiv>
        <MessageList
          messages={
            type === 'received'
              ? messages?.received ?? []
              : messages?.sent ?? []
          }
          messageArchiveFn={handleMessageArchivation}
          isReceivedList={type === 'received'}
        />
      </FlexDiv>
    </Container>
  );
};

export default ViewMessages;
