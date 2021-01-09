import React from "react";
import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/Form/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import routes from "../constants/routes";

export const Login: React.FC = () => {
  const [, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login({ payload: values });
          console.log("response", response);
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors));
          } else if (response.data?.login.user) {
            router.push(routes.HOME);
          }
        }}>
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              label="username"
              placeholder="Username"
              />
            <Box mt={4}>
              <InputField
                name="password"
                label="password"
                placeholder="Password"
                type="password"
                />
            </Box>
            <Button
              colorScheme="teal"
              isLoading={isSubmitting}
              mt={4}
              type="submit">
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Login;
