import { withUrqlClient } from 'next-urql';
import Layout from '../components/Layout';
import { usePostsQuery } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import NextLink from 'next/link';
import { Link } from '@chakra-ui/core';
import routes from '../constants/routes';

const Index = () => {
  const [{ data }] = usePostsQuery();
  return (
    <Layout>
      <NextLink href={routes['CREATE-POST']}>
        <Link>Create Post</Link>
      </NextLink>
      <br />
      <br />
      <br />
      <br />

      {!data ? (
        <div>loading....</div>
      ) : (
        data.posts.map((post) => <div key={post.id}>{post.title}</div>)
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
