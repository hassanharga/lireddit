import { Box, Button } from '@chakra-ui/core';
import { Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import { useState } from 'react';
import InputField from '../components/Form/InputField';
import Wrapper from '../components/Wrapper';
import routes from '../constants/routes';
import { useForgetPasswordMutation } from '../generated/graphql';
import { withApollo } from '../utils/withApollo';

export const ForgetPassword = () => {
  const [complete, setComplete] = useState(false);
  const [forgetPassword] = useForgetPasswordMutation();
  const router = useRouter();

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgetPassword({ variables: values });
          setComplete(true);
          setTimeout(() => {
            router.push(routes.HOME);
          }, 200);
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>if an account with that email exists, we send an email</Box>
          ) : (
            <Form>
              <InputField
                name='email'
                label='Email'
                placeholder='email'
                type='email'
              />

              <Button
                colorScheme='teal'
                isLoading={isSubmitting}
                mt={4}
                type='submit'
              >
                Forget Password
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withApollo({ ssr: false })(ForgetPassword);
