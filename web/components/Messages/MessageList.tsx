import { type Message } from '@data-types/messages';
import { CenteredDivHorizontal, FlexDiv } from '@components/Common/Alignment';
import { Strong, Text, A } from '@components/Common/Text';
import styled, { useTheme } from 'styled-components';
import { shortenString } from '@utils/formatters';
import { ButtonTertiary } from '@components/Common/Button';
import { spacing } from '@themes/spacing';
import { Spacer } from '@components/Common/Spacer';
import { Person } from '@components/Icons/Person';
import { useRouter } from 'next/router';

const MessageListItemContainer = styled(FlexDiv)`
  width: 100%;
  border: ${(props) => `1px solid ${props.theme.properties.colorBgText}`};
  padding: ${() => `${spacing.spacing_xs}px`};
`;

const MessageListItem = (props: {
  message: Message;
  isReceivedList: boolean;
}): JSX.Element => {
  const theme = useTheme();
  const router = useRouter();

  const date = new Date(props.message.createdAt).toLocaleDateString();
  const time = new Date(props.message.createdAt).toLocaleTimeString();

  const displayAddress = props.isReceivedList
    ? props.message.fromAddress
    : props.message.toAddress;

  const handleOpenMessage = (): void => {
    router.push(`/messages/detail/${props.message.id}`).catch(console.error);
  };

  return (
    <MessageListItemContainer>
      <FlexDiv style={{ width: '75%' }} onClick={handleOpenMessage}>
        <FlexDiv>
          <A href={`/profile/${displayAddress}`} target="_blank">
            <Person color={theme.properties.colorPrimary} />
          </A>
          <Spacer size={spacing.spacing_xxs} vertical={false} />
          <Text style={{ fontWeight: 'lighter' }}>
            {shortenString(displayAddress, 16)}
          </Text>
        </FlexDiv>
        <Spacer size={spacing.spacing_m} vertical={false} />
        <FlexDiv style={{ marginRight: 'auto', overflow: 'hidden' }}>
          <Strong>{props.message.subject}</Strong>
        </FlexDiv>
        <Spacer size={spacing.spacing_xs} vertical={false} />
        <FlexDiv style={{ marginLeft: 'auto' }}>
          <Text>
            {date} {time}
          </Text>
        </FlexDiv>
      </FlexDiv>
      <Spacer size={spacing.spacing_xs} vertical={false} />
      <FlexDiv style={{ marginLeft: 'auto' }}>
        <ButtonTertiary
          onClick={() => {
            console.log('TODO: Archive message');
          }}
        >
          Delete
        </ButtonTertiary>
      </FlexDiv>
    </MessageListItemContainer>
  );
};

export const MessageList = (props: {
  messages: Message[];
  isReceivedList: boolean;
}): JSX.Element => {
  if (props.messages.length === 0) {
    return (
      <CenteredDivHorizontal style={{ width: '100%' }}>
        <Text>No messages...</Text>
      </CenteredDivHorizontal>
    );
  }
  return (
    <FlexDiv style={{ width: '100%' }}>
      {props.messages.map((message, i) => (
        <MessageListItem
          message={message}
          isReceivedList={props.isReceivedList}
          key={i}
        />
      ))}
    </FlexDiv>
  );
};
