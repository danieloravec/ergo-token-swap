import styled from 'styled-components';

export const Heading1 = styled.h1`
  color: ${(props) => props.theme.properties.colorBgText};
`;

export const Heading2 = styled.h2`
  color: ${(props) => props.theme.properties.colorBgText};
`;

export const Heading3 = styled.h3`
  color: ${(props) => props.theme.properties.colorBgText};
`;

export const TextPrimaryWrapper = styled.span`
  color: ${(props) => props.theme.properties.colorPrimary};
`;

export const TextSecondaryWrapper = styled.span`
  color: ${(props) => props.theme.properties.colorSecondary};
`;

export const Text = styled.div`
  display: flex;
  color: ${(props) => props.theme.properties.colorBgText};
`;

export const TextNavs = styled.div`
  display: flex;
  color: ${(props) => props.theme.properties.colorNavsText};
`;

export const TextCenterAlign = styled(Text)`
  text-align: center;
`;

export const TextCenterAlignNavs = styled(TextNavs)`
  text-align: center;
`;

export const OrderedList = styled.ol`
  color: ${(props) => props.theme.properties.colorBgText};
`;

export const Strong = styled.strong``;

export const A = styled.a`
  color: ${(props) => props.theme.properties.colorPrimary};
  cursor: pointer;
`;

export const Input = styled.input`
  background: ${(props) => props.theme.properties.colorBg};
  color: ${(props) => props.theme.properties.colorBgText};
`;
