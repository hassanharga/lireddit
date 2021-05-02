import { Box, Heading } from '@chakra-ui/core';
import { withUrqlClient } from 'next-urql';
import React from 'react';
import Layout from '../../components/Layout';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';

const Post = () => {
  const [{ data, fetching }] = useGetPostFromUrl();

  return (
    <Layout>
      {fetching ? (
        <div>loading...</div>
      ) : !data?.post ? (
        <Box>Could not find the post</Box>
      ) : (
        <>
          <Heading cursor='pointer' fontSize='xl'>
            {data.post.title}
          </Heading>
          {data.post.text}
        </>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Post);
