import {
  CenteredDiv,
  CenteredDivHorizontal,
  Div,
} from '@components/Common/Alignment';
import { config } from '@config';
import { Heading1, TextCenterAlign, A } from '@components/Common/Text';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';

export const TradingSessionFinished = (props: {
  txId: string;
}): JSX.Element => {
  return (
    <CenteredDiv>
      <Div>
        <CenteredDivHorizontal>
          <Heading1>Success!</Heading1>
        </CenteredDivHorizontal>
        <CenteredDivHorizontal>
          <TextCenterAlign>
            The&nbsp;
            <A
              href={`${config.explorerFrontendUrl}/en/transactions/${props.txId}`}
            >
              transaction
            </A>
            &nbsp; was submitted successfully.
          </TextCenterAlign>
        </CenteredDivHorizontal>
        <CenteredDivHorizontal>
          <TextCenterAlign>Please wait for the confirmation.</TextCenterAlign>
        </CenteredDivHorizontal>
      </Div>
      <Spacer size={spacing.spacing_xxxl} vertical />
      <CenteredDivHorizontal>
        <TextCenterAlign>
          If the transaction is not confirmed within 1 hour, please open a new
          trading session and try again.
        </TextCenterAlign>
      </CenteredDivHorizontal>
    </CenteredDiv>
  );
};
