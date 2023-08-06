import { type Nft } from '@components/Swap/types';
import styled, { useTheme } from 'styled-components';
import React, { useEffect, useState } from 'react';
import { loadNftImageUrl } from '@utils/imageLoader';
import { getMintAddressByTokenId } from '@utils/verifyUtils';
import { backendRequest } from '@utils/utils';
import { CenteredDiv, Div, FlexDiv } from '@components/Common/Alignment';
import { StrongBg, Text, TextNavs } from '@components/Common/Text';
import Image from 'next/image';
import { spacing } from '@themes/spacing';

const ImageSelectedOverlay = styled(CenteredDiv)<{ imgSize: number }>`
  backdrop-filter: blur(4px) grayscale(100%) brightness(0.4);
  width: ${(props) => `${props.imgSize}px`};
  height: ${(props) => `${props.imgSize + 8}px`};
  margin-top: ${(props) => `${-props.imgSize - 8}px`};
`;

const StrongSecondary = styled(StrongBg)`
  color: ${(props) => props.theme.properties.colorNavsText};
`;

const UnverifiedWarning = (): JSX.Element => {
  const theme = useTheme();

  return (
    <span style={{ color: theme.properties.colorSecondary }}>
      UNVERIFIED 🚨
    </span>
  );
};

const CollectionName = (props: { name: string }): JSX.Element => {
  const theme = useTheme();

  return (
    <StrongBg style={{ color: theme.properties.colorPrimary }}>
      {props.name}
    </StrongBg>
  );
};

const VerificationLoading = (): JSX.Element => {
  const theme = useTheme();

  return (
    <span style={{ color: theme.properties.alertColors.info }}>
      Loading verification...
    </span>
  );
};

export const NftDisplay = (props: {
  nft: Nft;
  isSelected: boolean;
  onClick: (tokenId: string) => void;
  imgSize: number;
  captionColor?: string;
}): JSX.Element => {
  const theme = useTheme();
  const captionColor = props.captionColor ?? theme.properties.colorNavsText;

  const [unknownAssetType, setUnknownAssetType] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [mintAddress, setMintAddress] = useState<string | undefined>(undefined);
  const [collectionName, setCollectionName] = useState<string | undefined>(
    undefined
  );
  const [collectionNameLoaded, setCollectionNameLoaded] = useState(false);

  useEffect(() => {
    if (imageUrl === undefined) {
      const loadImage = async (): Promise<void> => {
        const url = await loadNftImageUrl(props.nft.tokenId);
        if (url !== undefined) {
          setImageUrl(url);
        } else {
          setUnknownAssetType(true);
        }
      };
      loadImage().catch(console.error);
    }
  });

  useEffect(() => {
    if (mintAddress !== undefined) {
      return;
    }
    const fetchMintAddress = async (): Promise<void> => {
      const mintAddress = await getMintAddressByTokenId(props.nft.tokenId);
      if (mintAddress !== undefined) {
        setMintAddress(mintAddress);
      }
    };
    fetchMintAddress().catch(console.error);
  }, [props.nft]);

  useEffect(() => {
    if (mintAddress === undefined) {
      return;
    }

    const fetchVerifiedMintAddress = async (): Promise<void> => {
      const collectionByMintAddressResponse = await backendRequest(
        `/collection/byMintingAddresses?mintingAddresses=${JSON.stringify([
          mintAddress,
        ])}`
      );
      if (collectionByMintAddressResponse.status !== 200) {
        console.error(
          `Error fetching collection name: ${JSON.stringify(
            collectionByMintAddressResponse
          )}`
        );
        return;
      }
      const collectionName =
        collectionByMintAddressResponse.body?.collectionsByMintAddress[
          mintAddress
        ]?.name;
      if (collectionName !== undefined) {
        setCollectionName(collectionName);
      }
      setCollectionNameLoaded(true);
    };
    fetchVerifiedMintAddress().catch(console.error);
  }, [props.nft, mintAddress]);

  const Img =
    imageUrl === undefined ? (
      <CenteredDiv
        style={{
          width: `${props.imgSize}px`,
          height: `${props.imgSize}px`,
          border: `1px solid ${theme.properties.colorBgText}`,
        }}
      >
        <TextNavs>
          {unknownAssetType ? 'UNKNOWN ASSET TYPE' : 'IMAGE LOADING...'}
        </TextNavs>
      </CenteredDiv>
    ) : (
      <Image
        src={imageUrl}
        alt={props.nft.name ?? 'nft-image'}
        width={props.imgSize}
        height={props.imgSize}
        onClick={() => {
          props.onClick(props.nft.tokenId);
        }}
      />
    );
  return (
    <div
      style={{
        border: `1px solid ${theme.properties.colorNavs}`,
        marginBottom: `${spacing.spacing_s}px`,
      }}
    >
      {props.isSelected ? (
        <Div>
          {Img}
          <ImageSelectedOverlay
            imgSize={props.imgSize}
            onClick={() => {
              props.onClick(props.nft.tokenId);
            }}
          >
            <Text>
              <StrongSecondary>DESELECT</StrongSecondary>
            </Text>
          </ImageSelectedOverlay>
        </Div>
      ) : (
        <Div>{Img}</Div>
      )}
      <CenteredDiv>
        <FlexDiv
          style={{
            marginBottom: spacing.spacing_xl,
            maxWidth: props.imgSize,
            overflowWrap: 'break-word',
            color: captionColor,
          }}
        >
          <FlexDiv>
            [
            {collectionNameLoaded ? (
              collectionName === undefined ? (
                <UnverifiedWarning />
              ) : (
                <CollectionName name={`${collectionName} ✅`} />
              )
            ) : (
              <VerificationLoading />
            )}
            ]
          </FlexDiv>
          <FlexDiv style={{ width: '100%' }}>{props.nft.name ?? '???'}</FlexDiv>
        </FlexDiv>
      </CenteredDiv>
    </div>
  );
};
