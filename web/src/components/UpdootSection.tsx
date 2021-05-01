import { Flex, IconButton } from '@chakra-ui/core';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import React, { useState } from 'react';
import { PostSnippetFragment, useVoteMutation } from '../generated/graphql';

type Props = {
  post: PostSnippetFragment;
};

const UpdootSection: React.FC<Props> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    'updoot-loading' | 'downdoot-loading' | 'not-loading'
  >('not-loading');
  const [, vote] = useVoteMutation();
  return (
    <Flex alignItems='center' justifyContent='center' mr={4} direction='column'>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }

          setLoadingState('updoot-loading');
          await vote({
            postId: post.id,
            value: 1,
          });
          setLoadingState('not-loading');
        }}
        aria-label='up vote'
        colorScheme={post.voteStatus === 1 ? 'green' : undefined}
        isLoading={loadingState === 'updoot-loading'}
        icon={<ChevronUpIcon />}
      />
      {post.points}
      <IconButton
        onClick={async () => {
          if (post.voteStatus === -1) {
            return;
          }
          setLoadingState('downdoot-loading');
          await vote({
            postId: post.id,
            value: -1,
          });
          setLoadingState('not-loading');
        }}
        isLoading={loadingState === 'downdoot-loading'}
        aria-label='down vote'
        colorScheme={post.voteStatus === -1 ? 'red' : undefined}
        icon={<ChevronDownIcon />}
      />
    </Flex>
  );
};

export default UpdootSection;
