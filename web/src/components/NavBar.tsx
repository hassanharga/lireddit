import React from 'react';
import { Box, Button, Flex, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import routes from '../constants/routes';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

const NavBar = () => {
  const [{ data, fetching }] = useMeQuery({
    // tell next not to run this on the server
    pause: isServer(),
  });
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation();
  let body = null;
  if (fetching) {
    body = null;
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href={routes.LOGIN}>
          <Link color='brown' mr={4}>
            Login
          </Link>
        </NextLink>
        <NextLink href={routes.REGISTER}>
          <Link color='brown'>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
      <Flex justify='space-between'>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          isLoading={logoutFetching}
          variant='link'
          onClick={() => {
            logout();
          }}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg='tan' position='sticky' top={0} zIndex={1} p={4}>
      <Box ml='auto'>{body}</Box>
    </Flex>
  );
};

export default NavBar;
