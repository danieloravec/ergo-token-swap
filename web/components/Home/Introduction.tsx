import { Heading1, OrderedList } from '@components/Common/Text';
import styled from 'styled-components';
import { Button } from '@components/Button';
import {
  CenteredDivHorizontal,
  FlexDivFloatLeft,
} from '@components/Common/Alignment';
import { Spacer } from '@components/Spacer';
import { spacing } from '@themes/spacing';

const IntroductionContainer = styled.div`
  width: 550px;
`;

export function Introduction(): JSX.Element {
  return (
    <IntroductionContainer>
      <Heading1>Swap Ergo assets instantly </Heading1>
      <FlexDivFloatLeft>
        <Spacer size={spacing.spacing_xs} vertical />
        <OrderedList>
          <li>Connect wallet.</li>
          <li> Create a private room for you and the other party. </li>
          <li> Send them a generated link and wait for them to connect.</li>
          <li> Select assets to swap.</li>
          <li>
            Sign the transaction and wait for the other party to sign it too.
          </li>
        </OrderedList>
      </FlexDivFloatLeft>
      <CenteredDivHorizontal>
        <Button>Start Trading Session</Button>
      </CenteredDivHorizontal>
    </IntroductionContainer>
  );
}

// const QuickStartSection: React.VFC = () => {
//   return (
//     <QuickStartSection>
//       <Text>Connect wallet.
//         Create a private room for you and the other party.
//         Send them a generated link and wait for them to connect.
//         Select assets to swap.
//         Sign the transaction and wait for the other party to sign it too.</Text>
//       <Text>Swap Ergo assets instantly </Text>
//       <ButtonPrimary>
//         <Frame1>
//           <Text>Start trading session</Text>
//         </Frame1>
//       </ButtonPrimary>
//     </QuickStartSection>
//   )
// }
// const QuickStartSection = styled.div`
//   height: 269px;
//   width: 611px;
//   background-color: #ffffff;
// `
// const text1 = styled.div`
//   text-align: left;
//   vertical-align: top;
//   font-size: 20px;
//   font-family: Chakra Petch;
//   line-height: auto;
//   color: #222831;
// `
// const text2 = styled.div`
//   text-align: left;
//   vertical-align: top;
//   font-size: 40px;
//   font-family: Chakra Petch;
//   line-height: auto;
//   color: #222831;
// `
// const ButtonPrimary = styled.div`
//   display: flex;
//   flex-direction: column;
//   justify-content: center;
//   align-items: center;
//   background-color: #ffffff;
// `
// const Frame1 = styled.div`
//   border-radius: 10px;
//   display: flex;
//   flex-direction: row;
//   justify-content: center;
//   align-items: center;
//   padding: 10px;
//   gap: 10px;
//   background-color: #038cbd;
// `
// const text3 = styled.div`
//   text-align: left;
//   vertical-align: top;
//   font-size: 16px;
//   font-family: Chakra Petch;
//   line-height: auto;
//   color: #ffffff;
// `
