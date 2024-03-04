import { type FungibleToken } from '@components/Swap/types';
import Image from 'next/image';
import { assetIconMap } from '@mappers/assetIconMap';
import styled from 'styled-components';
import React, { useState } from 'react';
import { Div, FlexDiv } from '@components/Common/Alignment';
import { StrongNavs, Text, TextNavs } from '@components/Common/Text';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';

export const FungibleTokenImage = (props: {
  fungibleToken: FungibleToken;
}): JSX.Element => {
  return (
    <Image
      src={
        assetIconMap[props.fungibleToken.tokenId] === undefined
          ? `/icons/generic-coin.svg`
          : `/icons/${assetIconMap[props.fungibleToken.tokenId]}`
      }
      alt={props.fungibleToken.name ?? 'token-image'}
      width={50}
      height={50}
    />
  );
};

const FungibleImageAndNameContainer = styled.div`
  width: 80px;
`;

export const FungibleTokenDisplay = (props: {
  fungibleToken: FungibleToken;
  initialValue: bigint;
  onChange: (newAmount: bigint) => void;
}): JSX.Element => {
  const isVerified = assetIconMap[props.fungibleToken.tokenId] !== undefined;
  const name = `${isVerified ? '✅' : '🚨'} ${
    props.fungibleToken.name ?? '???'
  }`;

  const [displayAmt, setDisplayAmt] = useState(
    String(
      Number(props.initialValue) / Math.pow(10, props.fungibleToken.decimals)
    )
  );
  const handleChange = (event: React.FormEvent<HTMLInputElement>): void => {
    const newDisplayValueStr = event.currentTarget.value;
    const newDisplayValueNum = Number(newDisplayValueStr);
    const newValueScaled = BigInt(
      Math.floor(
        newDisplayValueNum * Math.pow(10, props.fungibleToken.decimals)
      )
    );
    if (newDisplayValueNum < 0 || newValueScaled > props.fungibleToken.amount) {
      return;
    }
    setDisplayAmt(newDisplayValueStr);
    props.onChange(newValueScaled);
  };
  return (
    <FlexDiv style={{ alignItems: 'center', paddingBottom: '20px' }}>
      <FungibleImageAndNameContainer>
        <Div>
          <FungibleTokenImage fungibleToken={props.fungibleToken} />
        </Div>
        <Text style={{ maxWidth: 80, overflowWrap: 'break-word' }}>{name}</Text>
      </FungibleImageAndNameContainer>
      <Div>
        <TextNavs>
          <FlexDiv>
            <TextNavs>
              <StrongNavs>Available: </StrongNavs>
            </TextNavs>
            <Spacer size={spacing.spacing_xxs} vertical={false} />
            {Number(
              Number(props.fungibleToken.amount) /
                Math.pow(10, props.fungibleToken.decimals)
            ).toLocaleString('en-US', {
              maximumFractionDigits: props.fungibleToken.decimals,
              minimumFractionDigits: props.fungibleToken.decimals,
            })}
          </FlexDiv>
        </TextNavs>
        <TextNavs>
          <FlexDiv>
            <StrongNavs>Selected: </StrongNavs>
            <Spacer size={spacing.spacing_xxs} vertical={false} />
            <input
              style={{ width: '100px' }}
              value={displayAmt}
              type="number"
              onChange={handleChange}
            />
          </FlexDiv>
        </TextNavs>
      </Div>
    </FlexDiv>
  );
};
