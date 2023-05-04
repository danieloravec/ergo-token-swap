import { FlexDiv } from '@components/Common/Alignment';
import {
  Heading1,
  Heading2,
  Heading3,
  StrongBg,
  Text,
} from '@components/Common/Text';
import { useEffect, useState } from 'react';
import { type CollectionInfo } from '@data-types/collections';
import { backendRequest } from '@utils/utils';
import { ButtonTertiary } from '@components/Common/Button';
import styled, { useTheme } from 'styled-components';
import { Spacer } from '@components/Common/Spacer';
import { spacing } from '@themes/spacing';
import { useRouter } from 'next/router';

const CollectionTableEntryWrapper = styled(FlexDiv)`
  border: ${(props) => `1px solid ${props.theme.properties.colorNavs}`};
  width: 100%;
  padding: ${() => `${spacing.spacing_xxs}px`};
`;

const CollectionTableEntry = (props: {
  collection: CollectionInfo;
}): JSX.Element => {
  const theme = useTheme();

  const handleDelete = (): void => {
    console.error('TODO implement delete');
  };

  return (
    <CollectionTableEntryWrapper>
      <FlexDiv style={{ width: '100%' }}>
        <Heading3 style={{ color: theme.properties.colorSecondary }}>
          {props.collection.name}
        </Heading3>
      </FlexDiv>
      <FlexDiv style={{ width: '100%' }}>
        <StrongBg>Description: </StrongBg>
        <Spacer size={spacing.spacing_xxxs} vertical={false} />
        <Text>{props.collection.description}</Text>
      </FlexDiv>
      <FlexDiv>
        <FlexDiv style={{ width: '100%' }}>
          <StrongBg>Minting addresses: </StrongBg>
          <Spacer size={spacing.spacing_xxxs} vertical={false} />
        </FlexDiv>
        {props.collection.mintingAddresses.map((mintingAddress) => {
          return (
            <FlexDiv style={{ width: '100%' }} key={mintingAddress}>
              <Spacer size={spacing.spacing_xxl} vertical={false} />
              <Text>{mintingAddress}</Text>
            </FlexDiv>
          );
        })}
      </FlexDiv>
      <FlexDiv style={{ marginLeft: 'auto' }}>
        <ButtonTertiary onClick={handleDelete}>Delete</ButtonTertiary>
      </FlexDiv>
    </CollectionTableEntryWrapper>
  );
};

const CollectionList = (): JSX.Element => {
  const router = useRouter();
  const theme = useTheme();

  const [collections, setCollections] = useState<CollectionInfo[] | undefined>(
    undefined
  );
  const [isLoaded, setIsLoaded] = useState(false);

  const handleCollectionAddRedirect = (): void => {
    const redirect = async (): Promise<void> => {
      await router.push(`/admin/collection/add`);
    };
    redirect().catch(console.error);
  };

  useEffect(() => {
    const fetchCollections = async (): Promise<void> => {
      const collectionsResponse = await backendRequest('/collection');
      if (
        collectionsResponse.status === 200 &&
        collectionsResponse?.body?.collections !== undefined
      ) {
        setCollections(collectionsResponse?.body?.collections);
        setIsLoaded(true);
      } else {
        console.error(
          `Error while fetching collections: ${JSON.stringify(
            collectionsResponse
          )}`
        );
      }
    };
    fetchCollections().catch(console.error);
  }, [isLoaded]);

  if (!isLoaded) {
    return <Text>Loading...</Text>;
  }

  if (collections === undefined) {
    return <Text>Error loading collections...</Text>;
  }

  return (
    <FlexDiv style={{ width: '100%' }}>
      <Heading2 style={{ color: theme.properties.colorPrimary }}>
        Collections
      </Heading2>
      <FlexDiv>
        <Spacer size={spacing.spacing_xxs} vertical={false} />
      </FlexDiv>
      <FlexDiv
        style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 'auto' }}
      >
        <ButtonTertiary onClick={handleCollectionAddRedirect}>
          Add collection
        </ButtonTertiary>
      </FlexDiv>
      {collections.map((c) => {
        return <CollectionTableEntry collection={c} key={c.name} />;
      })}
    </FlexDiv>
  );
};

const AdminPage = (): JSX.Element => {
  return (
    <FlexDiv style={{ width: '80%' }}>
      <Heading1 style={{ width: '100%' }}>Admin section</Heading1>
      <hr />
      <CollectionList />
    </FlexDiv>
  );
};

export default AdminPage;
