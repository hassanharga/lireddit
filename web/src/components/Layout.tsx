import React from 'react';
import NavBar from './NavBar';
import Wrapper, { WrapperVarient } from './Wrapper';

const Layout: React.FC<{
  variant?: WrapperVarient;
}> = ({ variant, children }) => {
  return (
    <>
      <NavBar />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};

export default Layout;
