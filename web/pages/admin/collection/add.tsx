import { FlexDiv } from '@components/Common/Alignment';
import { Heading1, LargeInput } from '@components/Common/Text';
import { useTheme } from 'styled-components';
import React, { useState } from 'react';
import { ButtonSecondary } from '@components/Common/Button';
import { backendRequest, getCookie } from '@utils/utils';
import { Alert } from '@components/Common/Alert';

const AddCollectionForm = (): JSX.Element => {
  const theme = useTheme();

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [mintingAddressesStr, setMintingAddressesStr] = useState<string>('');
  const [mintingAddressesParsed, setMintingAddressesParsed] = useState<
    string[] | undefined
  >(undefined);
  const [message, setMessage] = useState<
    { type: 'success' | 'error'; text: string } | undefined
  >(undefined);

  const handleSubmit = (): void => {
    const addCollection = async (): Promise<void> => {
      setMessage(undefined);
      const adminAuthSecret = getCookie('adminAuthSecret');
      if (adminAuthSecret === undefined) {
        console.error('adminAuthSecret is undefined');
        return;
      }
      try {
        const backendResponse = await backendRequest('/collection', 'POST', {
          adminAuthSecret,
          name,
          description,
          mintingAddresses: mintingAddressesParsed,
        });
        if (backendResponse?.status !== 200) {
          setMessage({
            type: 'error',
            text: backendResponse.body.message,
          });
          return;
        }
      } catch (err) {
        setMessage({
          type: 'error',
          text: 'Unknown error',
        });
        return;
      }
      setMessage({
        type: 'success',
        text: 'Collection added successfully!',
      });
    };
    addCollection().catch(console.error);
  };

  return (
    <FlexDiv>
      {message !== undefined && (
        <Alert type={message.type} marginSides="0px">
          {message.text}
        </Alert>
      )}
      <Heading1 style={{ color: theme.properties.colorPrimary }}>
        Add a new collection
      </Heading1>
      <LargeInput
        type="text"
        placeholder="Collection name"
        value={name}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setName(e.target.value);
        }}
      />
      <LargeInput
        type="text"
        placeholder="Description"
        value={description}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setDescription(e.target.value);
        }}
      />
      <LargeInput
        type="text"
        placeholder="Comma-separated minting addresses"
        value={mintingAddressesStr}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setMintingAddressesStr(e.target.value);
          setMintingAddressesParsed(e.target.value.split(','));
        }}
      />
      <ButtonSecondary style={{ marginLeft: 'auto' }} onClick={handleSubmit}>
        Add collection
      </ButtonSecondary>
    </FlexDiv>
  );
};

export default AddCollectionForm;
