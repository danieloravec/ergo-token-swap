import {
  CenteredDivHorizontal,
  Div,
  MainSectionDiv,
} from '@components/Common/Alignment';
import { config } from '@config';
import { Heading1, TextCenterAlign, A } from '@components/Common/Text';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';

export const TradingSessionFinished = (props: {
  txId: string;
}): JSX.Element => {
  return (
    <MainSectionDiv>
      <Div>
        <CenteredDivHorizontal>
          <Heading1>Success!</Heading1>
        </CenteredDivHorizontal>
        <CenteredDivHorizontal>
          <TextCenterAlign>
            The{' '}
            <A
              href={`${config.explorerFrontendUrl}/en/transactions/${props.txId}`}
            >
              transaction
            </A>{' '}
            was submitted successfully.
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
          trading session and try again. No funds can be lost by opening new
          identiacal trading sessions.
        </TextCenterAlign>
      </CenteredDivHorizontal>
    </MainSectionDiv>
  );
};
