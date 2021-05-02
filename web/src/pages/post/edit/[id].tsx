import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import router from 'next/router';
import React from 'react';
import InputField from '../../../components/Form/InputField';
import Layout from '../../../components/Layout';
import routes from '../../../constants/routes';
import { useUpdatePostMutation } from '../../../generated/graphql';
import { createUrqlClient } from '../../../utils/createUrqlClient';
import { useGetPostFromUrl } from '../../../utils/useGetPostFromUrl';

const EditPost = () => {
  const [{ data, fetching }] = useGetPostFromUrl();
  const [, updatePost] = useUpdatePostMutation();
  return (
    <Layout variant='small'>
      {fetching ? (
        <div>loading...</div>
      ) : !data?.post ? (
        <Box>Could not find the post</Box>
      ) : (
        <>
          <Formik
            initialValues={{
              title: data?.post?.title || '',
              text: data?.post?.text || '',
            }}
            onSubmit={async (values) => {
              if (data.post?.id) {
                const { error } = await updatePost({
                  ...values,
                  id: data.post.id,
                });
                if (!error) {
                  router.push(routes.HOME);
                }
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form>
                <InputField name='title' label='Title' placeholder='title' />
                <Box mt={4}>
                  <InputField
                    name='text'
                    label='Body'
                    placeholder='text...'
                    isTextArea
                  />
                </Box>

                <Button
                  colorScheme='teal'
                  isLoading={isSubmitting}
                  mt={4}
                  type='submit'
                >
                  Update Post
                </Button>
              </Form>
            )}
          </Formik>
        </>
      )}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient)(EditPost);
