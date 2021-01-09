import React from 'react';
import { Box } from '@chakra-ui/core';

interface Props {
  variant?: 'small' | 'regular';
}

const Wrapper: React.FC<Props> = ({ variant, children }) => (
  <Box
    mt={8}
    mx='auto'
    maxW={variant === 'regular' ? '800px' : '400px'}
    width='100%'
  >
    {children}
  </Box>
);

export default Wrapper;
