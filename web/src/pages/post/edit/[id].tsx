import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import router from 'next/router';
import React from 'react';
import InputField from '../../../components/Form/InputField';
import Layout from '../../../components/Layout';
import { useUpdatePostMutation } from '../../../generated/graphql';
import { useGetPostFromUrl } from '../../../utils/useGetPostFromUrl';
import { withApollo } from '../../../utils/withApollo';

const EditPost = () => {
  const { data, loading } = useGetPostFromUrl();
  const [updatePost] = useUpdatePostMutation();
  return (
    <Layout variant='small'>
      {loading ? (
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
                const { errors } = await updatePost({
                  variables: { ...values, id: data.post.id },
                });
                if (!errors) {
                  router.back();
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

export default withApollo({ ssr: false })(EditPost);
