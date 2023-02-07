import styled from 'styled-components';
import { useThemeStore } from '@components/hooks';
import { type HTMLProps } from 'react';
import { type Theme } from '@themes/themes';

export const StyledButton = styled.button`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  position: relative;
  width: 200px;
  height: 50px;
  border-radius: 10px;
  background: ${(props: HTMLProps<HTMLButtonElement> & { theme: Theme }) =>
    props.theme.properties.colorPrimary};
`;

export function Button(props: HTMLProps<HTMLButtonElement>): JSX.Element {
  const { theme } = useThemeStore();
  // FIXME solve this somehow
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  return <StyledButton theme={theme} {...props} />;
}
