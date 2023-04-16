import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { type Message, type MessageStructure } from '@data-types/messages';
import { useWalletStore } from '@components/Wallet/hooks';
import { useJwtAuth } from '@components/hooks';
import { loadMessages } from '@utils/dataLoader';
import { CenteredDivHorizontal, FlexDiv } from '@components/Common/Alignment';
import { Heading1, Strong, Text } from '@components/Common/Text';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import styled, { useTheme } from 'styled-components';
import { ButtonSecondary } from '@components/Common/Button';

const MessageDetailContainer = styled(FlexDiv)`
  font-size: 1.2rem;
  width: 100%;

  @media (min-width: 600px) {
    width: 80%;
  }

  @media (min-width: 1000px) {
    width: 60%;
  }

  @media (min-width: 1600px) {
    width: 50%;
  }
`;

export const MessageDetail = (): JSX.Element => {
  const router = useRouter();
  const theme = useTheme();
  const { address, wallet } = useWalletStore();
  const { jwt, setJwt } = useJwtAuth();

  const { messageId } = router.query;
  const [isLoaded, setIsLoaded] = useState(false);
  const [message, setMessage] = useState<Message | undefined>(undefined);

  const replyAddress =
    message?.fromAddress === address
      ? message?.toAddress
      : message?.fromAddress;

  useEffect(() => {
    loadMessages(address, jwt, setJwt, wallet, (messages: MessageStructure) => {
      for (const m of messages.sent.concat(messages.received)) {
        if (String(m.id) === messageId) {
          setMessage(m);
          break;
        }
      }
      setIsLoaded(true);
    }).catch(console.error);
  }, [isLoaded]);

  if (!isLoaded) {
    return <Text>Loading...</Text>;
  }

  if (message === undefined) {
    return <Text>Message not found...</Text>;
  }

  return (
    <CenteredDivHorizontal>
      <MessageDetailContainer>
        <FlexDiv style={{ width: '100%' }}>
          <Heading1>MESSAGE DETAIL</Heading1>
        </FlexDiv>
        <Spacer size={spacing.spacing_xs} vertical />

        <FlexDiv style={{ width: '100%' }}>
          <Spacer size={spacing.spacing_m} vertical={false} />
          <Strong>Subject:</Strong>
          <Spacer size={spacing.spacing_xxs} vertical={false} />
          <Text>{message.subject}</Text>
        </FlexDiv>
        <Spacer size={spacing.spacing_xs} vertical />

        <FlexDiv style={{ width: '100%' }}>
          <Spacer size={spacing.spacing_m} vertical={false} />
          <Strong>From: </Strong>
          <Spacer size={spacing.spacing_xxs} vertical={false} />
          <Text>{message.fromAddress}</Text>
        </FlexDiv>
        <Spacer size={spacing.spacing_xs} vertical />

        <FlexDiv style={{ width: '100%' }}>
          <Spacer size={spacing.spacing_m} vertical={false} />
          <Strong>To: </Strong>
          <Spacer size={spacing.spacing_xxs} vertical={false} />
          <Text>{message.toAddress}</Text>
        </FlexDiv>

        <hr style={{ width: '100%', color: theme.properties.colorBgText }} />

        <FlexDiv style={{ width: '100%' }}>
          <FlexDiv style={{ marginLeft: `${spacing.spacing_m}px` }}>
            <Text>{message.text}</Text>
          </FlexDiv>
        </FlexDiv>
        <Spacer size={spacing.spacing_xs} vertical />

        {replyAddress !== undefined && (
          <FlexDiv style={{ width: '100%' }}>
            <FlexDiv style={{ marginLeft: 'auto' }}>
              <ButtonSecondary
                onClick={() => {
                  router
                    .push(
                      `/messages/send?recipient=${replyAddress}&subject=${Buffer.from(
                        'Re: ' + (message?.subject ?? '')
                      ).toString('hex')}`
                    )
                    .catch(console.error);
                }}
              >
                Reply
              </ButtonSecondary>
            </FlexDiv>
          </FlexDiv>
        )}
      </MessageDetailContainer>
    </CenteredDivHorizontal>
  );
};

export default MessageDetail;
