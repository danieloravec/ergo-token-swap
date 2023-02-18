import { CenteredDivVertical, FlexDiv } from '@components/Common/Alignment';
import { Heading1, Heading3 } from '@components/Common/Text';
import { useState } from 'react';
import styled, { ThemeProvider, useTheme } from 'styled-components';

interface AccordionProps {
  width?: string;
  title: string;
  entries: Array<{
    question: string;
    answer: string;
  }>;
}

const SvgMaybeRotated = styled.svg<{ rotated: boolean }>`
  transform: ${(props) => (props.rotated ? 'rotate(90deg)' : 'rotate(0deg)')};
`;

const Arrow = (props: { rotated: boolean }): JSX.Element => {
  return (
    <SvgMaybeRotated
      rotated={props.rotated}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 6 10"
      width="24"
      height="24"
    >
      <path d="m1 0l5 5-5 5-1-1 4-4-4-4" />
    </SvgMaybeRotated>
  );
};

const AccordionContainer = styled.div<{ width?: string }>`
  width: ${(props) => props.width ?? '100%'};
  color: ${(props) => props.theme.properties.colorBgText};
`;

const AccordionItemWrapper = styled(FlexDiv)`
  width: 100%;
  border-bottom: ${(props) =>
    `1px solid ${props.theme.properties.colorBgText}`};
`;

const HeadingArrowWrapper = styled(CenteredDivVertical)`
  flex-direction: row;
  align-items: center;
  width: 100%;
  justify-content: space-between;
`;

export const Accordion = (props: AccordionProps): JSX.Element => {
  const theme = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <AccordionContainer width={props.width}>
        <Heading1>{props.title}</Heading1>
        {props.entries.map((entry, idx) => {
          return (
            <AccordionItemWrapper
              onClick={() => {
                if (idx === openIndex) {
                  setOpenIndex(null);
                } else {
                  setOpenIndex(idx);
                }
              }}
            >
              <HeadingArrowWrapper>
                <Heading3>{entry.question}</Heading3>
                <Arrow rotated={idx === openIndex} />
              </HeadingArrowWrapper>
              {idx === openIndex && (
                <p style={{ width: '100%' }}>{entry.answer}</p>
              )}
            </AccordionItemWrapper>
          );
        })}
      </AccordionContainer>
    </ThemeProvider>
  );
};
