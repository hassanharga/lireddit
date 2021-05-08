import { Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/core';
import NextLink from 'next/link';
import React from 'react';
import EditDeletePostButtons from '../components/EditDeletePostButtons';
import Layout from '../components/Layout';
import UpdootSection from '../components/UpdootSection';
import routes from '../constants/routes';
import { PostsQuery, usePostsQuery } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

const Index = () => {
  const { data, loading, fetchMore, variables } = usePostsQuery({
    variables: {
      limit: 10,
      cursor: null,
    },
    notifyOnNetworkStatusChange: true,
  });

  const fetchMoreHandler = async (data: any) => {
    await fetchMore({
      variables: {
        limit: variables!.limit,
        cursor: data.posts.posts[data.posts.posts.length - 1].createdAt,
      },
      // it's deprecated
      // updateQuery: (previousValues, { fetchMoreResult }): PostsQuery => {
      //   if (!fetchMoreResult) {
      //     return previousValues as PostsQuery;
      //   }
      //   return {
      //     __typename: 'Query',
      //     posts: {
      //       __typename: 'PaginatedPosts',
      //       hasMore: (fetchMoreResult as PostsQuery).posts.hasMore,
      //       posts: [
      //         ...(previousValues as PostsQuery).posts.posts,
      //         ...(fetchMoreResult as PostsQuery).posts.posts,
      //       ],
      //     },
      //   };
      // },
    });
  };

  return (
    <Layout>
      {!data && loading ? (
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
              fetchMoreHandler(data);
            }}
            isLoading={loading}
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

export default withApollo({ ssr: true })(Index);
