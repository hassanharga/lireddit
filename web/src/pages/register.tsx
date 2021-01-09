import React from "react";
import { Box, Button } from "@chakra-ui/core";
import { Form, Formik } from "formik";
import Wrapper from "../components/Wrapper";
import InputField from "../components/Form/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import routes from "../constants/routes";

export const Register: React.FC = () => {
  const [, register] = useRegisterMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values);
          console.log("response", response);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors));
          } else if (response.data?.register.user) {
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
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default Register;
