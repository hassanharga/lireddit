import { cacheExchange } from '@urql/exchange-graphcache';
import Router from 'next/router';
import { dedupExchange, Exchange, fetchExchange } from 'urql';
import { pipe, tap } from 'wonka';
import routes from '../constants/routes';
import {
  DeletePostMutationVariables,
  LoginMutation,
  LogoutMutation,
  MeDocument,
  MeQuery,
  RegisterMutation,
  VoteMutationVariables,
} from '../generated/graphql';
import { betterUpdatequery } from './betterUpdatequery';
import { cursorPagination } from './cursorPagination';
import gql from 'graphql-tag';
import { isServer } from './isServer';

// handle error globally
const errorExchange: Exchange = ({ forward }) => ($ops) => {
  return pipe(
    forward($ops),
    tap(({ error }) => {
      if (error?.message.includes('not authenticated')) {
        Router.replace(routes.LOGIN);
      }
    })
  );
};

export const createUrqlClient = (ssrExchange: any, ctx: any) => {
  let cookie = '';
  if (isServer()) {
    cookie = ctx?.req?.headers?.cookie;
  }
  return {
    url: 'http://localhost:3001/graphql',
    fetchOptions: {
      credentials: 'include' as const,
      headers: cookie ? { cookie } : undefined,
    },
    exchanges: [
      dedupExchange,
      cacheExchange({
        keys: {
          PaginatedPosts: () => null,
        },
        resolvers: {
          Query: {
            posts: cursorPagination(),
          },
        },
        updates: {
          Mutation: {
            deletePost: (_result, args, cache, _info) => {
              cache.invalidate({
                __typename: 'Post',
                id: (args as DeletePostMutationVariables).id,
              });
            },
            vote: (_result, args, cache, _info) => {
              const { postId, value } = args as VoteMutationVariables;
              const data = cache.readFragment(
                gql`
                  fragment _ on Post {
                    id
                    points
                    voteStatus
                  }
                `,
                { id: postId } as any
              );
              if (data) {
                if (data.voteStatus === value) {
                  return;
                }
                const newPoints =
                  data.points + (!data.votestatus ? 1 : 2) * value;
                cache.writeFragment(
                  gql`
                    fragment __ on Post {
                      points
                      voteStatus
                    }
                  `,
                  { id: postId, points: newPoints, voteStatus: value }
                );
              }
            },
            createPost: (_result, _args, cache, _info) => {
              const allFields = cache.inspectFields('Query');
              const fieldInfos = allFields.filter(
                (info) => info.fieldName === 'posts'
              );
              fieldInfos.forEach((fi) => {
                cache.invalidate('Query', 'posts', fi.arguments || {});
              });
            },
            logout: (result, _args, cache, _info) => {
              betterUpdatequery<LogoutMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                () => ({
                  me: null,
                })
              );
            },
            login: (result, _args, cache, _info) => {
              betterUpdatequery<LoginMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                (res, qu) => {
                  if (res.login.errors) {
                    return qu;
                  }
                  return {
                    me: res.login.user,
                  };
                }
              );
            },
            register: (result, _args, cache, _info) => {
              betterUpdatequery<RegisterMutation, MeQuery>(
                cache,
                { query: MeDocument },
                result,
                (r, q) => {
                  if (r.register.errors) {
                    return q;
                  }
                  return {
                    me: r.register.user,
                  };
                }
              );
            },
          },
        },
      }),
      errorExchange,
      ssrExchange,
      fetchExchange,
    ],
  };
};
