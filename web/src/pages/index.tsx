import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/core';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import Layout from '../components/Layout';
import UpdootSection from '../components/UpdootSection';
import routes from '../constants/routes';
import {
  useDeletePostMutation,
  useMeQuery,
  usePostsQuery,
} from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';

const Index = () => {
  const [variables, setVariables] = useState({
    limit: 10,
    cursor: null as null | string,
  });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });

  const [{ data: currentUser }] = useMeQuery();

  const [, deletePost] = useDeletePostMutation();
  const router = useRouter();
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
                      {currentUser?.me?.id === post.creatorId && (
                        <Box ml='auto'>
                          <IconButton
                            aria-label='edit post'
                            mr={5}
                            icon={<EditIcon />}
                            onClick={() => {
                              router.push(`${routes['Edit-post']}/${post.id}`);
                            }}
                          />
                          <IconButton
                            aria-label='delete post'
                            icon={<DeleteIcon />}
                            onClick={async () => {
                              await deletePost({
                                id: post.id,
                              });
                            }}
                          />
                        </Box>
                      )}
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
