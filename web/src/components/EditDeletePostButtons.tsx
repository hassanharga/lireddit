import { Box, IconButton } from '@chakra-ui/core';
import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import router from 'next/router';
import React from 'react';
import routes from '../constants/routes';
import { useDeletePostMutation, useMeQuery } from '../generated/graphql';

const EditDeletePostButtons: React.FC<{ id: number; creatorId: number }> = ({
  id,
  creatorId,
}) => {
  const [, deletePost] = useDeletePostMutation();
  const [{ data: currentUser }] = useMeQuery();

  return (
    <>
      {currentUser?.me?.id === creatorId ? (
        <Box>
          <IconButton
            aria-label='edit post'
            mr={5}
            icon={<EditIcon />}
            onClick={() => {
              router.push(`${routes['Edit-post']}/${id}`);
            }}
          />
          <IconButton
            aria-label='delete post'
            icon={<DeleteIcon />}
            onClick={async () => {
              await deletePost({
                id,
              });
            }}
          />
        </Box>
      ) : null}
    </>
  );
};

export default EditDeletePostButtons;
