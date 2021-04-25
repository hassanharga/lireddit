import React, { InputHTMLAttributes } from 'react';
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Textarea,
} from '@chakra-ui/core';
import { useField } from 'formik';

type InputFieldProps = InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> & {
  label: string;
  name: string;
  isTextArea?: boolean;
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  isTextArea,
  size: _,
  ...props
}) => {
  let InputOrTextArea: any = Input;
  if (isTextArea) {
    InputOrTextArea = Textarea;
  }
  const [field, { error }] = useField(props);
  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>{' '}
      <InputOrTextArea {...field} {...props} id={field.name} />
      {/* {isTextArea ? (
        <Input {...field} {...props} id={field.name} />
      ) : (
        <Textarea {...field} {...props} id={field.name} />
      )} */}
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};

export default InputField;
