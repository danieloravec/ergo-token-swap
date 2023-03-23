import { type ProfileInfo } from '@data-types/profile';
import { CenteredDivVertical, FlexDiv } from '@components/Common/Alignment';
import Image from 'next/image';
import { Heading2, Text } from '@components/Common/Text';
import styled, { useTheme } from 'styled-components';
import { ButtonTertiary } from '@components/Common/Button';
import { Discord } from '@components/Icons/Discord';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import React from 'react';
import { Twitter } from '@components/Icons/Twitter';
import { Email } from '@components/Icons/Email';
import { useWalletStore } from '@components/Wallet/hooks';
import { useRouter } from 'next/router';

const ProfileHeaderContainer = styled(FlexDiv)`
  width: 80%;
  height: 150px;
`;

const ProfileImage = (props: { height: number }): JSX.Element => {
  return (
    <FlexDiv>
      <Image
        src="/token-swap-beast.png"
        alt="profile-image"
        width={props.height} // 1:1 ratio
        height={props.height}
        style={{ borderRadius: '10px' }}
      />
    </FlexDiv>
  );
};

const AddressTextWrapper = styled(Text)`
  font-size: 20px;
`;

export const ProfileHeader = (props: { data: ProfileInfo }): JSX.Element => {
  const theme = useTheme();
  const profilePhotoHeight = 100;
  const { address } = useWalletStore();
  const router = useRouter();

  return (
    <ProfileHeaderContainer>
      <FlexDiv style={{ width: `${profilePhotoHeight + spacing.spacing_m}px` }}>
        <FlexDiv style={{ width: '100%' }}>
          <ProfileImage height={profilePhotoHeight} />
        </FlexDiv>
        <FlexDiv>
          {address === props.data.address ? (
            <ButtonTertiary
              onClick={() => {
                void (async (): Promise<void> => {
                  await router.push('/profile/edit');
                })();
              }}
            >
              Edit
            </ButtonTertiary>
          ) : (
            <ButtonTertiary
              onClick={() => {
                console.error('NOT IMPLEMENTED');
              }}
              disabled={props.data.allowMessages !== true}
            >
              Message
            </ButtonTertiary>
          )}
        </FlexDiv>
      </FlexDiv>
      <FlexDiv style={{ alignContent: 'flex-start', width: '80%' }}>
        <FlexDiv style={{ height: `${profilePhotoHeight}px` }}>
          <FlexDiv style={{ width: '100%' }}>
            <Heading2>PROFILE</Heading2>
          </FlexDiv>
          <FlexDiv style={{ width: '100%' }}>
            <AddressTextWrapper>{props.data.address}</AddressTextWrapper>
          </FlexDiv>
        </FlexDiv>
        <FlexDiv
          style={{ marginTop: `${spacing.spacing_xxs}px`, width: '100%' }}
        >
          {props.data.discord !== null && (
            <FlexDiv>
              <CenteredDivVertical style={{ flexDirection: 'row' }}>
                <Discord color={theme.properties.colorPrimary} />
              </CenteredDivVertical>
              <Spacer size={spacing.spacing_xxxs} vertical={false} />
              <Text>{props.data.discord}</Text>
              <Spacer size={spacing.spacing_xs} vertical={false} />
            </FlexDiv>
          )}
          {props.data.twitter !== null && (
            <FlexDiv>
              <CenteredDivVertical style={{ flexDirection: 'row' }}>
                <Twitter color={theme.properties.colorPrimary} />
              </CenteredDivVertical>
              <Spacer size={spacing.spacing_xxxs} vertical={false} />
              <Text>{props.data.twitter}</Text>
              <Spacer size={spacing.spacing_xs} vertical={false} />
            </FlexDiv>
          )}
          {props.data.email !== null && (
            <FlexDiv>
              <CenteredDivVertical style={{ flexDirection: 'row' }}>
                <Email color={theme.properties.colorPrimary} />
              </CenteredDivVertical>
              <Spacer size={spacing.spacing_xxxs} vertical={false} />
              <Text>{props.data.email}</Text>
              <Spacer size={spacing.spacing_xs} vertical={false} />
            </FlexDiv>
          )}
        </FlexDiv>
      </FlexDiv>
    </ProfileHeaderContainer>
  );
};
