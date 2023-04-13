import { FlexDiv } from '@components/Common/Alignment';
import { Heading1, Input, Textarea } from '@components/Common/Text';
import { ButtonSecondary } from '@components/Common/Button';
import styled from 'styled-components';
import React from 'react';
import { useWalletStore } from '@components/Wallet/hooks';
import { WalletNotConnected } from '@components/Common/WalletNotConnected';
import NoSsr from '@components/Common/NoSsr';

const MessageFormContainer = styled(FlexDiv)`
  width: 100%;
  @media (min-width: 600px) {
    width: 80%;
  }
  @media (min-width: 1000px) {
    width: 50%;
  }
`;

const WideFlexDiv = styled(FlexDiv)`
  width: 100%;
`;

const WideInput = styled(Input)`
  width: 100%;
  margin: 10px 0 10px 0;
  min-height: 50px;
  font-size: 24px;
`;

const WideTextarea = styled(Textarea)`
  width: 100%;
  font-size: 24px;
  margin: 10px 0 10px 0;
`;

const SendMessagePage = (): JSX.Element => {
  const { address } = useWalletStore();

  if (address === undefined) {
    return (
      <NoSsr>
        <WalletNotConnected />
      </NoSsr>
    );
  }

  return (
    <NoSsr>
      <MessageFormContainer>
        <Heading1>SEND A MESSAGE</Heading1>
        <WideFlexDiv>
          <WideInput placeholder="Receiver address" />
        </WideFlexDiv>
        <WideFlexDiv>
          <WideInput placeholder="Subject" />
        </WideFlexDiv>
        <WideTextarea rows={10} placeholder="Message" />
        <WideFlexDiv>
          <ButtonSecondary style={{ width: '100%' }}>Send</ButtonSecondary>
        </WideFlexDiv>
      </MessageFormContainer>
    </NoSsr>
  );
};

export default SendMessagePage;
