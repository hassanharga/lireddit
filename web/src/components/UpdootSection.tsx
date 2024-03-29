import { Flex, IconButton } from '@chakra-ui/core';
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';
import React, { useState } from 'react';
import {
  PostSnippetFragment,
  useVoteMutation,
  VoteMutation,
} from '../generated/graphql';
import gql from 'graphql-tag';
import { ApolloCache } from '@apollo/client';

type Props = {
  post: PostSnippetFragment;
};

const updateAfterVote = (
  value: number,
  postId: number,
  cache: ApolloCache<VoteMutation>
) => {
  const data = cache.readFragment<{
    id: number;
    points: number;
    voteStatus: number | null;
  }>({
    id: `Post:${postId}`,
    fragment: gql`
      fragment _ on Post {
        id
        points
        voteStatus
      }
    `,
  });
  if (data) {
    if (data.voteStatus === value) {
      return;
    }
    const newPoints = data.points + (!data.voteStatus ? 1 : 2) * value;
    cache.writeFragment({
      id: `Post:${postId}`,
      fragment: gql`
        fragment __ on Post {
          points
          voteStatus
        }
      `,
      data: { points: newPoints, voteStatus: value },
    });
  }
};

const UpdootSection: React.FC<Props> = ({ post }) => {
  const [loadingState, setLoadingState] = useState<
    'updoot-loading' | 'downdoot-loading' | 'not-loading'
  >('not-loading');
  const [vote] = useVoteMutation();
  return (
    <Flex alignItems='center' justifyContent='center' mr={4} direction='column'>
      <IconButton
        onClick={async () => {
          if (post.voteStatus === 1) {
            return;
          }

          setLoadingState('updoot-loading');
          await vote({
            variables: { postId: post.id, value: 1 },
            update: (cache) => updateAfterVote(1, post.id, cache),
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
            variables: { postId: post.id, value: -1 },
            update: (cache) => updateAfterVote(-1, post.id, cache),
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
