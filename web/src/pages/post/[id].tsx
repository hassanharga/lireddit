import { Box, Heading } from '@chakra-ui/core';
import React from 'react';
import EditDeletePostButtons from '../../components/EditDeletePostButtons';
import Layout from '../../components/Layout';
import { useGetPostFromUrl } from '../../utils/useGetPostFromUrl';
import { withApollo } from '../../utils/withApollo';

const Post = () => {
  const { data, loading } = useGetPostFromUrl();

  return (
    <Layout>
      {loading ? (
        <div>loading...</div>
      ) : !data?.post ? (
        <Box>Could not find the post</Box>
      ) : (
        <>
          <Heading cursor='pointer' fontSize='xl'>
            {data.post.title}
          </Heading>
          <Box mb={4}>{data.post.text}</Box>
          <EditDeletePostButtons
            id={data.post.id}
            creatorId={data.post.creatorId}
          />
        </>
      )}
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
