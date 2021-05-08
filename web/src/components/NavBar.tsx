import { useApolloClient } from '@apollo/client';
import { Box, Button, Flex, Heading, Link } from '@chakra-ui/core';
import NextLink from 'next/link';
import React from 'react';
import routes from '../constants/routes';
import { useLogoutMutation, useMeQuery } from '../generated/graphql';
import { isServer } from '../utils/isServer';

const NavBar = () => {
  const apolloClient = useApolloClient();
  const { data, loading } = useMeQuery({
    // tell next not to run this on the server
    skip: isServer(),
  });
  const [logout, { loading: logoutFetching }] = useLogoutMutation();
  let body = null;
  if (loading) {
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
      <Flex justify='space-between' align='center'>
        <NextLink href={routes['CREATE-POST']}>
          <Button mr={4}>Create Post</Button>
        </NextLink>
        <Box mr={2}>{data.me.username}</Box>
        <Button
          isLoading={logoutFetching}
          variant='link'
          onClick={async () => {
            await logout();
            await apolloClient.resetStore();
            // router.reload();
          }}
        >
          Logout
        </Button>
      </Flex>
    );
  }

  return (
    <Flex bg='tan' position='sticky' top={0} zIndex={1} p={4} align='center'>
      <Flex flex={1} m='auto' align='center' maxW={600}>
        <NextLink href={routes.HOME}>
          <Link>
            <Heading fontSize='xl'>LiReddit </Heading>
          </Link>
        </NextLink>
        <Box ml='auto'>{body}</Box>
      </Flex>
    </Flex>
  );
};

export default NavBar;
