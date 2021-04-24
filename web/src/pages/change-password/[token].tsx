import { Box, Button, Flex, Link } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { NextPage } from 'next';
import { withUrqlClient } from 'next-urql';
import NextLink from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import InputField from '../../components/Form/InputField';
import Wrapper from '../../components/Wrapper';
import routes from '../../constants/routes';
import { useChangePasswordMutation } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';
import { toErrorMap } from '../../utils/toErrorMap';

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = useState('');
  return (
    <div>
      <Wrapper variant='small'>
        <Formik
          initialValues={{ newPassword: '' }}
          onSubmit={async (values, { setErrors }) => {
            const response = await changePassword({
              token,
              newPassword: values.newPassword,
            });
            //   console.log("response", response);
            if (response.data?.changePassword.errors) {
              const errorMap = toErrorMap(response.data.changePassword.errors);
              if ('token' in errorMap) {
                setTokenError(errorMap.token);
              }
              setErrors(errorMap);
            } else if (response.data?.changePassword.user) {
              router.push(routes.HOME);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form>
              <InputField
                name='newPassword'
                label='New Password'
                placeholder='New Password'
                type='password'
              />
              {tokenError && (
                <Flex>
                  <Box mr={2} style={{ color: 'red' }}>
                    {tokenError}
                  </Box>
                  <NextLink href={routes['FORGET-PASSWORD']}>
                    <Link>click here to get a new one</Link>
                  </NextLink>
                </Flex>
              )}
              <Button
                colorScheme='teal'
                isLoading={isSubmitting}
                mt={4}
                type='submit'
              >
                Change Password
              </Button>
            </Form>
          )}
        </Formik>
      </Wrapper>
    </div>
  );
};

ChangePassword.getInitialProps = ({ query }) => {
  return {
    token: query.token as string,
  };
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
