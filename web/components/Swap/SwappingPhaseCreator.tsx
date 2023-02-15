import { ThemeProvider, useTheme } from 'styled-components';
import { CenteredDiv, Div, MainSectionDiv } from '@components/Common/Alignment';
import {
  type FungibleToken,
  type Nft,
  TokenSelection,
} from '@components/Swap/TokenSelection';
import { Button } from '@components/Common/Button';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';

export interface ParticipantInfo {
  address: string;
  nfts: Nft[];
  fungibleTokens: FungibleToken[];
}

export function SwappingPhaseCreator(props: {
  creatorInfo: ParticipantInfo;
  guestInfo: ParticipantInfo;
}): JSX.Element {
  const theme = useTheme();
  return (
    <ThemeProvider theme={theme}>
      <MainSectionDiv>
        <CenteredDiv>
          <TokenSelection
            description="YOUR WALLET"
            headingNft={
              <span>
                Select tokens to <strong>send</strong> by clicking them.
              </span>
            }
            headingFungible={
              <span>
                Specify amounts of tokens to <strong>send</strong>.
              </span>
            }
            nfts={props.creatorInfo.nfts}
            fungibleTokens={props.creatorInfo.fungibleTokens}
          />
          <Spacer size={spacing.spacing_xxxl} vertical={false} />
          <Div>
            <CenteredDiv style={{ height: '100%' }}>
              <Button
                onClick={() => {
                  console.log('TODO implement swap button');
                }}
              >
                Swap
              </Button>
            </CenteredDiv>
          </Div>
          <Spacer size={spacing.spacing_xxxl} vertical={false} />
          <TokenSelection
            description="GUEST WALLET"
            headingNft={
              <span>
                Select tokens to <strong>receive</strong> by clicking them.
              </span>
            }
            headingFungible={
              <span>
                Specify amounts of tokens to <strong>receive</strong>.
              </span>
            }
            nfts={props.guestInfo.nfts}
            fungibleTokens={props.guestInfo.fungibleTokens}
          />
        </CenteredDiv>
      </MainSectionDiv>
    </ThemeProvider>
  );
}
