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
import { useState } from 'react';
import { buildUnsignedMultisigSwapTx } from '@ergo/transactions';
import { type Wallet } from '@ergo/wallet';
import { backendRequest } from '@utils/utils';
import { type SignedInput } from '@fleet-sdk/common';
import { config } from '@config';

export interface ParticipantInfo {
  address: string;
  nfts: Nft[];
  fungibleTokens: FungibleToken[];
  nanoErg: bigint;
}

export function SwappingPhaseCreator(props: {
  wallet: Wallet;
  tradingSessionId: string;
  creatorInfo: ParticipantInfo;
  guestInfo: ParticipantInfo;
}): JSX.Element {
  const theme = useTheme();
  const [selectedNftsA, setSelectedNftsA] = useState<Record<string, bigint>>(
    {}
  );
  const [selectedFungibleTokensA, setSelectedFungibleTokensA] = useState<
    Record<string, bigint>
  >({});
  const [selectedNanoErgA, setSelectedNanoErgA] = useState<bigint>(BigInt(0));
  const [selectedNftsB, setSelectedNftsB] = useState<Record<string, bigint>>(
    {}
  );
  const [selectedFungibleTokensB, setSelectedFungibleTokensB] = useState<
    Record<string, bigint>
  >({});
  const [selectedNanoErgB, setSelectedNanoErgB] = useState<bigint>(BigInt(0));
  const [swapIsLoading, setSwapIsLoading] = useState(false);
  const [txId, setTxId] = useState<string | undefined>(undefined);
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
            nanoErg={props.creatorInfo.nanoErg}
            onChange={(
              newSelectedNfts: Record<string, bigint>,
              newSelectedNanoErg: bigint,
              newSelectedFungibleTokens: Record<string, bigint>
            ) => {
              setSelectedNftsA(newSelectedNfts);
              setSelectedNanoErgA(newSelectedNanoErg);
              setSelectedFungibleTokensA(newSelectedFungibleTokens);
            }}
          />
          <Spacer size={spacing.spacing_xxxl} vertical={false} />
          <Div>
            <CenteredDiv style={{ height: '100%' }}>
              {txId === undefined ? (
                <Button
                  disabled={swapIsLoading}
                  onClick={() => {
                    setSwapIsLoading(true);
                    (async () => {
                      const { unsignedTx, inputIndicesA, inputIndicesB } =
                        await buildUnsignedMultisigSwapTx({
                          wallet: props.wallet,
                          addressA: props.creatorInfo.address,
                          assetsToReceiveByA: {
                            ...selectedNftsB,
                            ...selectedFungibleTokensB,
                          },
                          nanoErgToReceiveByA: selectedNanoErgB,
                          addressB: props.guestInfo.address,
                          assetsToReceiveByB: {
                            ...selectedNftsA,
                            ...selectedFungibleTokensA,
                          },
                          nanoErgToReceiveByB: selectedNanoErgA,
                        });
                      // TODO sign unsignedInputsA here instead of just logging
                      console.log(`unsignedTx: ${JSON.stringify(unsignedTx)}`);
                      console.log(
                        `inputIndicesA: ${JSON.stringify(inputIndicesA)}`
                      );
                      console.log(
                        `inputIndicesB: ${JSON.stringify(inputIndicesB)}`
                      );
                      // TODO use the commented snipped instead of mocked empty array once sign_tx_inputs is implemented
                      const signedInputsA: SignedInput[] = [];
                      // const signedInputsA = await props.wallet.sign_tx_inputs(
                      //   unsignedTx,
                      //   inputIndicesA.map((idx) => unsignedTx.inputs[idx])
                      // );

                      // Register the partial tx
                      const txPartialRegisterResponse = await backendRequest(
                        '/tx/partial/register',
                        'POST',
                        {
                          secret: props.tradingSessionId,
                          unsignedTx,
                          signedInputsCreator: signedInputsA,
                          inputIndicesCreator: inputIndicesA,
                          inputIndicesGuest: inputIndicesB,
                        }
                      );
                      if (txPartialRegisterResponse.status !== 200) {
                        throw new Error('Failed to register partial tx');
                      }

                      // Poll for /tx/{secret} and wait until the tx is submitted (save the txId to show explorer link)
                      let foundTxId: string | undefined;
                      while (foundTxId === undefined) {
                        const txResponse = await backendRequest(
                          `/tx?secret=${props.tradingSessionId}`,
                          'GET'
                        );
                        if (txResponse.status !== 200) {
                          throw new Error('Failed to get tx');
                        }
                        if (txResponse.body.submitted as boolean) {
                          foundTxId = txResponse.body.txId;
                        }
                        await new Promise((resolve) =>
                          setTimeout(resolve, 1000)
                        );
                      }
                      setTxId(foundTxId);
                      // TODO test this all together now
                    })().catch(console.error);
                  }}
                >
                  {swapIsLoading ? <span>Waiting...</span> : <span>Swap</span>}
                </Button>
              ) : (
                <Div>
                  The{' '}
                  <a
                    href={`${config.explorerFrontendUrl}/en/transactions/en/${txId}`}
                  >
                    transaction
                  </a>{' '}
                  was submitted successfully
                </Div>
              )}
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
            nanoErg={props.guestInfo.nanoErg}
            onChange={(
              newSelectedNfts: Record<string, bigint>,
              newSelectedNanoErg: bigint,
              newSelectedFungibleTokens: Record<string, bigint>
            ) => {
              setSelectedNftsB(newSelectedNfts);
              setSelectedNanoErgB(newSelectedNanoErg);
              setSelectedFungibleTokensB(newSelectedFungibleTokens);
            }}
          />
        </CenteredDiv>
      </MainSectionDiv>
    </ThemeProvider>
  );
}
