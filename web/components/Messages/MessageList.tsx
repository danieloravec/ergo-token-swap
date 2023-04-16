import { type Message } from '@data-types/messages';
import { CenteredDivHorizontal, FlexDiv } from '@components/Common/Alignment';
import { Strong, Text, A } from '@components/Common/Text';
import styled, { useTheme } from 'styled-components';
import { shortenString } from '@utils/formatters';
import { ButtonTertiary } from '@components/Common/Button';
import { spacing } from '@themes/spacing';
import { Spacer } from '@components/Common/Spacer';
import { Person } from '@components/Icons/Person';

const MessageListItemContainer = styled(FlexDiv)`
  width: 100%;
  border: 1px solid #e0e0e0;
  padding: ${() => `${spacing.spacing_xs}px`};
`;

const MessageListItem = (props: {
  message: Message;
  isReceivedList: boolean;
}): JSX.Element => {
  const theme = useTheme();

  const date = new Date(props.message.createdAt).toLocaleDateString();
  const time = new Date(props.message.createdAt).toLocaleTimeString();

  const displayAddress = props.isReceivedList
    ? props.message.fromAddress
    : props.message.toAddress;

  const handleOpenMessage = (): void => {
    console.log('TODO: Open message');
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
          {date} {time}
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
