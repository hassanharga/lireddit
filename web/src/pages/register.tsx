import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/Form/InputField';
import Wrapper from '../components/Wrapper';
import routes from '../constants/routes';
import { MeDocument, MeQuery, useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withApollo } from '../utils/withApollo';

export const Register: React.FC = () => {
  const [register] = useRegisterMutation();
  const router = useRouter();

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '', username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register({
            variables: { payload: values },
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.register.user,
                },
              });
              cache.evict({ fieldName: 'posts{}' });
            },
          });
          console.log('response', response);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
            router.push(routes.HOME);
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='username'
              label='username'
              placeholder='Username'
            />
            <Box mt={4}>
              <InputField name='email' label='email' placeholder='Email' />
            </Box>
            <Box mt={4}>
              <InputField
                name='password'
                label='password'
                placeholder='Password'
                type='password'
              />
            </Box>
            <Button
              colorScheme='teal'
              isLoading={isSubmitting}
              mt={4}
              type='submit'
            >
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Register);
