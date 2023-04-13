import { CenteredDivHorizontal, Div } from '@components/Common/Alignment';
import { Heading3 } from '@components/Common/Text';
import { ConnectWalletButton } from '@components/Wallet/ConnectWalletButton';
import React from 'react';

export function WalletNotConnected(): JSX.Element {
  return (
    <Div>
      <Div>
        <CenteredDivHorizontal>
          <Heading3>
            In order to access this section, please connect your wallet.
          </Heading3>
        </CenteredDivHorizontal>
        <CenteredDivHorizontal>
          <ConnectWalletButton />
        </CenteredDivHorizontal>
      </Div>
    </Div>
  );
}
