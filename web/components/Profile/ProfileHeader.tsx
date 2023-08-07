import { type ProfileInfo } from '@data-types/profile';
import { CenteredDivVertical, FlexDiv } from '@components/Common/Alignment';
import Image from 'next/image';
import { A, Heading2, Text } from '@components/Common/Text';
import styled, { useTheme } from 'styled-components';
import { ButtonTertiary } from '@components/Common/Button';
import { Discord } from '@components/Icons/Discord';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { useEffect, useState } from 'react';
import { Twitter } from '@components/Icons/Twitter';
import { Email } from '@components/Icons/Email';
import { useWalletStore } from '@components/Wallet/hooks';
import { useRouter } from 'next/router';
import { ExternalLink } from '@components/Icons/ExternalLink';
import { config } from '@config';
import { shortenString } from '@utils/formatters';
import { Favourite } from '@components/Icons/Favourite';
import { backendRequest } from '@utils/utils';
import { useJwtAuth, useWindowDimensions } from '@components/hooks';

const ProfileHeaderContainer = styled(FlexDiv)`
  width: 80%;
  height: 150px;
`;

export const ProfileImage = (props: { height: number }): JSX.Element => {
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

const AddressSectionWrapper = styled(FlexDiv).attrs(
  (props: { leftContentWidthPx?: number }) => ({
    leftContentWidthPx: props.leftContentWidthPx ?? 100,
  })
)`
  align-content: flex-start;
  width: ${(props) => `calc(100% - ${props.leftContentWidthPx}px)`};
`;

export const ProfileHeader = (props: {
  data: ProfileInfo;
  disableFavourite?: boolean;
}): JSX.Element => {
  const theme = useTheme();
  const { address } = useWalletStore();
  const router = useRouter();
  const { jwt } = useJwtAuth();
  const { width } = useWindowDimensions();

  const [isFavourited, setIsFavourited] = useState<boolean>(false);

  const profilePhotoHeight = width >= 768 ? 100 : 50;
  const totalPhotoSectionWidth = profilePhotoHeight + spacing.spacing_m;

  const handleFavouriteClick = (): void => {
    const addOrRemoveFavourite = async (
      action: 'ADD' | 'REMOVE'
    ): Promise<void> => {
      if (address === undefined) {
        return;
      }
      const addOrRemoveFavouriteResponse = await backendRequest(
        '/user/follow',
        action === 'ADD' ? 'POST' : 'DELETE',
        {
          fromAddress: address,
          toAddress: props.data.address,
        },
        {
          Authorization: jwt ?? '',
        }
      );
      if (addOrRemoveFavouriteResponse.status !== 200) {
        console.error(
          `Failed to add or remove favourite: ${JSON.stringify(
            addOrRemoveFavouriteResponse
          )}`
        );
      } else {
        setIsFavourited(addOrRemoveFavouriteResponse.body.followed);
      }
    };
    if (isFavourited) {
      addOrRemoveFavourite('REMOVE').catch(console.error);
    } else {
      addOrRemoveFavourite('ADD').catch(console.error);
    }
  };

  useEffect(() => {
    const fetchIsFavourited = async (): Promise<void> => {
      if (address === undefined) {
        return;
      }
      const isFavouritedResponse = await backendRequest(
        `/user/follow/specific?fromAddress=${address}&toAddress=${props.data.address}`
      );
      if (isFavouritedResponse.status !== 200) {
        console.error(`Failed to fetch isFavourited: ${isFavouritedResponse}`);
      } else {
        setIsFavourited(isFavouritedResponse.body.followed);
      }
    };
    fetchIsFavourited().catch(console.error);
  });

  return (
    <ProfileHeaderContainer>
      <FlexDiv style={{ width: `${totalPhotoSectionWidth}px` }}>
        <FlexDiv style={{ width: '100%' }}>
          <FlexDiv style={{ alignContent: 'center' }}>
            <ProfileImage height={profilePhotoHeight} />
          </FlexDiv>
        </FlexDiv>
        {width >= 768 && (
          <FlexDiv style={{ width: '100%' }}>
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
                  router
                    .push(`/messages/send?recipient=${props.data.address}`)
                    .catch(console.error);
                  console.error('NOT IMPLEMENTED');
                }}
                disabled={props.data.allowMessages === false}
              >
                Message
              </ButtonTertiary>
            )}
          </FlexDiv>
        )}
      </FlexDiv>
      <AddressSectionWrapper leftContentWidthPx={totalPhotoSectionWidth}>
        <FlexDiv style={{ height: `${profilePhotoHeight}px` }}>
          <FlexDiv style={{ width: '100%' }}>
            {address !== undefined &&
              address !== props.data.address &&
              props.disableFavourite !== true && (
                <FlexDiv onClick={handleFavouriteClick}>
                  <Favourite
                    full={isFavourited}
                    size="32"
                    color={
                      isFavourited
                        ? theme.properties.colorSecondary
                        : theme.properties.colorBgText
                    }
                  />
                  <Spacer size={spacing.spacing_xxs} vertical={false} />
                </FlexDiv>
              )}
            <FlexDiv
              style={{ width: '80%' }}
              onClick={() => {
                const redirectToProfile = async (): Promise<void> => {
                  await router.push(`/profile/${props.data.address}`);
                };
                redirectToProfile().catch(console.error);
              }}
            >
              <Heading2>
                {props.data.username?.toUpperCase() ?? 'PROFILE'}
              </Heading2>
            </FlexDiv>
          </FlexDiv>
          <FlexDiv style={{ width: '100%' }}>
            <AddressTextWrapper>
              {shortenString(props.data.address, width < 768 ? 12 : 28)}
            </AddressTextWrapper>
            <Spacer size={spacing.spacing_xxxs} vertical={false} />
            <CenteredDivVertical>
              <A
                href={`${config.explorerFrontendUrl}/en/addresses/${props.data.address}`}
                target="_blank"
              >
                <ExternalLink color={theme.properties.colorPrimary} />
              </A>
            </CenteredDivVertical>
          </FlexDiv>
        </FlexDiv>
        <FlexDiv
          style={{ marginTop: `${spacing.spacing_xs}px`, width: '100%' }}
        >
          {props.data.discord !== null && props.data.discord !== undefined && (
            <FlexDiv>
              <CenteredDivVertical style={{ flexDirection: 'row' }}>
                <Discord color={theme.properties.colorPrimary} />
              </CenteredDivVertical>
              <Spacer size={spacing.spacing_xxxs} vertical={false} />
              <Text>{props.data.discord}</Text>
              <Spacer size={spacing.spacing_xs} vertical={false} />
            </FlexDiv>
          )}
          {props.data.twitter !== null && props.data.twitter !== undefined && (
            <A
              href={`https://twitter.com/${props.data.twitter}`}
              target="_blank"
            >
              <FlexDiv>
                <CenteredDivVertical style={{ flexDirection: 'row' }}>
                  <Twitter color={theme.properties.colorPrimary} />
                </CenteredDivVertical>
                <Spacer size={spacing.spacing_xxxs} vertical={false} />
                <Text>{props.data.twitter}</Text>
                <Spacer size={spacing.spacing_xs} vertical={false} />
              </FlexDiv>
            </A>
          )}
          {props.data.email !== null && props.data.email !== undefined && (
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
      </AddressSectionWrapper>
    </ProfileHeaderContainer>
  );
};
