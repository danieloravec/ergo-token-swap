import { CenteredDivVertical, FlexDiv } from '@components/Common/Alignment';
import { Heading1, Heading3 } from '@components/Common/Text';
import { useState, useRef, useLayoutEffect } from 'react';
import styled from 'styled-components';
import { useSpring, animated } from '@react-spring/web';

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
  fill: ${(props) => props.theme.properties.colorBgText};
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <AccordionContainer width={props.width}>
      <Heading1>{props.title}</Heading1>
      {props.entries.map((entry, idx) => {
        const [height, setHeight] = useState(0);
        const contentRef = useRef<HTMLDivElement>(null);

        useLayoutEffect(() => {
          setHeight(contentRef.current?.offsetHeight ?? 0);
        });

        const isOpen = idx === openIndex;

        const openAnimation = useSpring({
          from: {
            opacity: isOpen ? 0 : 1,
            height: isOpen ? '0px' : `${height}px`,
          },
          to: { opacity: isOpen ? 1 : 0, height: isOpen ? `${height}px` : '0' },
          config: { duration: 150 },
        });

        return (
          <AccordionItemWrapper
            key={idx}
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
            <animated.div style={openAnimation}>
              <div ref={contentRef}>{entry.answer}</div>
            </animated.div>
          </AccordionItemWrapper>
        );
      })}
    </AccordionContainer>
  );
};
