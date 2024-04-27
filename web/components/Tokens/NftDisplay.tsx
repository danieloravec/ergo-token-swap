import { type Nft } from '@components/Swap/types';
import styled, { useTheme } from 'styled-components';
import React, { useEffect, useState } from 'react';
import { loadNftImageUrl } from '@utils/imageLoader';
import { getMintAddressByTokenId } from '@utils/verifyUtils';
import { backendRequest } from '@utils/utils';
import { CenteredDiv, Div, FlexDiv } from '@components/Common/Alignment';
import { A, StrongBg, Text, TextNavs } from '@components/Common/Text';
import { spacing } from '@themes/spacing';
import { config } from '@config';
import { ExternalLink } from '@components/Icons/ExternalLink';
import { Spacer } from '@components/Common/Spacer';
import ImageWithFallback from '@components/Common/ImageWithFallback';
import { blitzData } from '@utils/special/blitz';

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

const CollectionName = (props: {
  name: string;
  verifiedBy: string;
}): JSX.Element => {
  const theme = useTheme();

  return (
    <StrongBg
      title={`Verified by ${props.verifiedBy}`}
      style={{ color: theme.properties.colorPrimary }}
    >
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

interface SkyHarborCollection {
  name: string;
  mint_addresses: Array<{ address: string }>;
}

export const NftDisplay = (props: {
  nft: Nft;
  isSelected: boolean;
  onClick: (tokenId: string) => void;
  imgSize: number;
  onIsUnverified?: () => void;
  onIsVerified?: () => void;
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
  const [verificationType, setVerificationType] = useState<
    'SkyHarbor.io' | 'single-tx-swap.com' | 'nobody'
  >('nobody');

  useEffect(() => {
    if (props.nft.tokenId in blitzData) {
      setVerificationType('single-tx-swap.com');
      setCollectionName('Blitz TCG');
      setCollectionNameLoaded(true);
    }
  }, []);

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

    const getCollectionFromSkyHarbor = async (): Promise<boolean> => {
      if (config.specialOnly) {
        return false;
      }

      const skyHarborResponse = await fetch(
        `${config.skyHarborApiUrl}/rest/verified/address/${mintAddress}`,
        {
          method: 'GET',
        }
      );
      const collections = (await skyHarborResponse.json())?.collections;
      if (collections === undefined || collections.length === 0) {
        return false;
      }
      const collectionNamesWithScore: Array<{ name: string; score: number }> =
        collections.map((c: SkyHarborCollection) => {
          let score = 0;
          for (let prefixLen = 0; prefixLen < c.name.length; prefixLen++) {
            if (props.nft.name.includes(c.name.slice(0, prefixLen))) {
              score++;
            }
          }
          return { name: c.name, score };
        });
      const bestMatchCollectionName = collectionNamesWithScore.sort(
        (
          a: { name: string; score: number },
          b: { name: string; score: number }
        ) => b.score - a.score
      )[0].name;
      setCollectionName(bestMatchCollectionName);
      setVerificationType('SkyHarbor.io');
      setCollectionNameLoaded(true);
      return true;
    };

    // Fallback in case SkyHarbor does not return anything valid
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
        setVerificationType('single-tx-swap.com');
      }
      setCollectionNameLoaded(true);
    };

    getCollectionFromSkyHarbor()
      .then((isVerified: boolean) => {
        if (config.customVerification && !isVerified) {
          fetchVerifiedMintAddress().catch(console.error);
        }
      })
      .catch(console.error);
  }, [props.nft, mintAddress]);

  useEffect(() => {
    if (!collectionNameLoaded) {
      return;
    }
    if (collectionName === undefined && props.onIsUnverified !== undefined) {
      props.onIsUnverified();
    } else if (
      collectionName !== undefined &&
      props.onIsVerified !== undefined
    ) {
      props.onIsVerified();
    }
  }, [collectionNameLoaded]);

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
      <ImageWithFallback
        src={imageUrl}
        fallbackSrc="/icons/couldnt-load-image.svg"
        alt={props.nft.name ?? 'nft-image'}
        width={props.imgSize}
        height={props.imgSize}
        onClick={() => {
          props.onClick(props.nft.tokenId);
        }}
      />
    );

  // Only allow Blitz NFTs
  if (!(props.nft.tokenId in blitzData)) {
    return <></>;
  }

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
                <CollectionName
                  name={`${collectionName} ✅`}
                  verifiedBy={verificationType}
                />
              )
            ) : (
              <VerificationLoading />
            )}
            ]
          </FlexDiv>
          <FlexDiv style={{ width: '100%' }}>
            {props.nft.name ?? '???'}
            <Spacer size={spacing.spacing_xxxs} vertical={false} />
            <A
              href={`${config.explorerFrontendUrl}/en/token/${props.nft.tokenId}`}
              target="_blank"
            >
              <ExternalLink color={theme.properties.colorPrimary} />
            </A>
          </FlexDiv>
        </FlexDiv>
      </CenteredDiv>
    </div>
  );
};
