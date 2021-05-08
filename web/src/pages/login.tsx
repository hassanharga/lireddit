import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';
import InputField from '../components/Form/InputField';
import Wrapper from '../components/Wrapper';
import routes from '../constants/routes';
import { MeDocument, MeQuery, useLoginMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { withApollo } from '../utils/withApollo';

export const Login: React.FC = () => {
  const [login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({
            variables: values,
            update: (cache, { data }) => {
              cache.writeQuery<MeQuery>({
                query: MeDocument,
                data: {
                  __typename: 'Query',
                  me: data?.login.user,
                },
              });
              cache.evict({ fieldName: 'posts:{}' });
            },
          });
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            if (typeof router.query.next === 'string') {
              router.push(router.query.next);
            } else {
              router.push(routes.HOME);
            }
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name='usernameOrEmail'
              label='username or email'
              placeholder='Username Or Email'
            />
            <Box mt={4}>
              <InputField
                name='password'
                label='password'
                placeholder='Password'
                type='password'
              />
            </Box>
            <Flex mt={2}>
              <NextLink href={routes['FORGET-PASSWORD']}>
                <Link ml='auto'>forget password?</Link>
              </NextLink>
            </Flex>
            <Button
              colorScheme='teal'
              isLoading={isSubmitting}
              mt={4}
              type='submit'
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(Login);
