import { type Swap } from '@components/Profile/types';
import { Person } from '@components/Icons/Person';
import { useTheme } from 'styled-components';
import { CenteredDivHorizontal, FlexDiv } from '@components/Common/Alignment';
import { Text, A, StrongBg } from '@components/Common/Text';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { shortenString } from '@utils/formatters';
import { ExternalLink } from '@components/Icons/ExternalLink';
import { config } from '@config';

const SwapHistoryTableEntry = (props: {
  swap: Swap;
  userAddr: string;
}): JSX.Element => {
  const theme = useTheme();
  const role = props.swap.host_addr === props.userAddr ? 'Host' : 'Guest';
  const counterpartyAddr =
    props.swap.host_addr === props.userAddr
      ? props.swap.guest_addr
      : props.swap.host_addr;
  const swapTimestampDt = new Date(props.swap.timestamp);

  return (
    <FlexDiv
      style={{
        width: '100%',
        minHeight: '50px',
        border: `1px solid ${theme.properties.colorNavs}`,
      }}
    >
      <CenteredDivHorizontal
        style={{
          width: '10%',
        }}
      >
        <StrongBg>{role}</StrongBg>
      </CenteredDivHorizontal>

      <CenteredDivHorizontal style={{ width: '30%' }}>
        <A href={`/profile/${counterpartyAddr}`} target="_blank">
          <Person color={theme.properties.colorPrimary} />
        </A>
        <Spacer size={spacing.spacing_xxs} vertical={false} />
        <Text>{shortenString(counterpartyAddr, 32)}</Text>
      </CenteredDivHorizontal>

      <CenteredDivHorizontal style={{ width: '30%' }}>
        <A
          href={`${config.explorerFrontendUrl}/en/transactions/${props.swap.tx_id}`}
          target="_blank"
        >
          <ExternalLink color={theme.properties.colorPrimary} />
        </A>
        <Spacer size={spacing.spacing_xxs} vertical={false} />
        <Text>{shortenString(props.swap.tx_id, 32)}</Text>
      </CenteredDivHorizontal>

      <CenteredDivHorizontal style={{ width: '30%' }}>
        <CenteredDivHorizontal style={{ width: '100%' }}>
          <Text>
            {swapTimestampDt.toLocaleDateString()}{' '}
            {swapTimestampDt.toLocaleTimeString()}
          </Text>
        </CenteredDivHorizontal>
      </CenteredDivHorizontal>
    </FlexDiv>
  );
};

export const SwapHistory = (props: {
  history: Swap[] | undefined;
  userAddr: string;
}): JSX.Element => {
  if (props.history === undefined) {
    return <Text>Loading history...</Text>;
  }
  if (props.history.length === 0) {
    return <Text>No swaps performed yet</Text>;
  }

  return (
    <FlexDiv style={{ width: '100%' }}>
      {props.history.map((swap) => {
        return (
          <SwapHistoryTableEntry
            swap={swap}
            userAddr={props.userAddr}
            key={swap.tx_id}
          />
        );
      })}
    </FlexDiv>
  );
};
