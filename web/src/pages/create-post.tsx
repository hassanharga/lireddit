import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/Form/InputField';
import Layout from '../components/Layout';
import routes from '../constants/routes';
import { useCreatePostMutation } from '../generated/graphql';
import { createUrqlClient } from '../utils/createUrqlClient';
import { useIsAuth } from '../utils/useIsAuth';

const CreatePost: React.FC = () => {
  const [, createPost] = useCreatePostMutation();
  const router = useRouter();
  useIsAuth();

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values) => {
          const { error } = await createPost({
            payload: {
              ...values,
            },
          });
          // console.log('error[createPost]', error);
          if (!error) {
            router.push(routes.HOME);
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
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient)(CreatePost);
