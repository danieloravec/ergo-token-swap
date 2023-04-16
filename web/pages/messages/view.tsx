import { useEffect, useState } from 'react';
import { type MessageStructure } from '@data-types/messages';
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
    loadMessages(address, jwt, setJwt, wallet, (messages: MessageStructure) => {
      setMessages(messages);
      setIsLoaded(true);
    }).catch(console.error);
  }, [isLoaded]);

  if (messages === undefined && !isLoaded) {
    return <Text>Loading messages...</Text>;
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
          isReceivedList={type === 'received'}
        />
      </FlexDiv>
    </Container>
  );
};

export default ViewMessages;
