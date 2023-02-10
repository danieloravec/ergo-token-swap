import dynamic from 'next/dynamic';
import React from 'react';

const NoSsr = (props: {
  children:
    | string
    | number
    | boolean
    | React.ReactElement<any, string | React.JSXElementConstructor<any>>
    | React.ReactFragment
    | React.ReactPortal
    | null
    | undefined;
}): JSX.Element => <React.Fragment>{props.children}</React.Fragment>;

export default dynamic(async () => NoSsr, {
  ssr: false,
});
