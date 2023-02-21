import { CenteredDiv, MainSectionDiv } from '@components/Common/Alignment';
import { Heading1 } from '@components/Common/Text';

export const LoadingPage = (): JSX.Element => {
  return (
    <MainSectionDiv>
      <CenteredDiv>
        <Heading1>Loading...</Heading1>
      </CenteredDiv>
    </MainSectionDiv>
  );
};
