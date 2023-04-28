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
import {
  ButtonSecondary,
  ButtonTertiarySquared,
} from '@components/Common/Button';
import { markMessage } from '@utils/messageUtils';
import { type AlertType } from '@themes/themes';
import { Alert } from '@components/Common/Alert';

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
  const [alertMessage, setAlertMessage] = useState<
    { type: AlertType; message: string } | undefined
  >(undefined);

  const replyAddress =
    message?.fromAddress === address
      ? message?.toAddress
      : message?.fromAddress;

  useEffect(() => {
    loadMessages(
      address,
      setJwt,
      wallet,
      (messages: MessageStructure) => {
        for (const m of messages.sent.concat(messages.received)) {
          if (String(m.id) === messageId) {
            setMessage(m);
            break;
          }
        }
        setIsLoaded(true);
      },
      jwt
    ).catch(console.error);
    if (message !== undefined) {
      markMessage(message.id, true, jwt ?? '').catch(console.error);
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return <Text>Loading...</Text>;
  }

  if (message === undefined) {
    return <Text>Message not found...</Text>;
  }

  return (
    <CenteredDivHorizontal>
      {alertMessage !== undefined && (
        <Alert type={alertMessage.type}>{alertMessage.message}</Alert>
      )}
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
              <ButtonTertiarySquared
                onClick={() => {
                  const markAndSetMessage = async (): Promise<void> => {
                    const markSuccess = await markMessage(
                      message.id,
                      false,
                      jwt ?? ''
                    );
                    setAlertMessage({
                      type: markSuccess ? 'success' : 'error',
                      message: markSuccess
                        ? 'Message marked as unread.'
                        : 'Error while marking message as unread',
                    });
                  };
                  markAndSetMessage().catch(console.error);
                }}
              >
                Mark as unread
              </ButtonTertiarySquared>

              <Spacer size={spacing.spacing_xxs} vertical={false} />

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
