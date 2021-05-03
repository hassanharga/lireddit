import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import React, { useState } from 'react';
import EditDeletePostButtons from '../components/EditDeletePostButtons';
import Layout from '../components/Layout';
import UpdootSection from '../components/UpdootSection';
import routes from '../constants/routes';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  return (
    <Layout>
      {!data && fetching ? (
        <div>loading....</div>
      ) : (
        <Stack spacing={8} css={{ margin: '20px 0' }}>
          {data &&
            data.posts.posts.map((post) =>
              !post ? null : (
                <Flex key={post.id} p={5} shadow='md' borderWidth='1px'>
                  <UpdootSection post={post} />
                  <Box flex={1}>
                    <NextLink
                      href={routes['Post-Details']}
                      as={`/post/${post.id}`}
                    >
                      <Heading cursor='pointer' fontSize='xl'>
                        {post.title}
                      </Heading>
                    </NextLink>
                    <Text> posted by {post.creator.username}</Text>
                    <Flex align='center'>
                      <Text flex={1} mt={4}>
                        {post.textSnippet}
                      </Text>
                      <Box ml='auto'>
                        <EditDeletePostButtons
                          id={post.id}
                          creatorId={post.creatorId}
                        />
                      </Box>
                    </Flex>
                  </Box>
                </Flex>
              )
            )}
        </Stack>
      )}
      {data && data.posts.hasMore && (
        <Flex>
          <Button
            onClick={() => {
              setVariables({
                ...variables,
                cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
              });
            }}
            isLoading={fetching}
            m='auto'
            my={8}
          >
            load more
          </Button>
        </Flex>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
